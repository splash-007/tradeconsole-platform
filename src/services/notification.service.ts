// NOTIFICATION SERVICE
// Frontend abstraction for the platform-wide notification system.
//
// IMPORTANT DESIGN PRINCIPLES:
// - READ ≠ DISMISSED
//   READ: The user has seen the notification.
//   DISMISSED: The user intentionally removed it from their active feed.
//   Historical record is ALWAYS retained regardless of read/dismiss state.
//
// - Notification state is USER-SPECIFIC.
//   Admin A reading notification X does NOT mark it read for Admin B.
//
// - Notifications must represent MEANINGFUL customer events.
//   Do NOT generate notifications for: page views, tab changes, hover,
//   dropdown opens, watchlist stars, or normal navigation.
//
// - Frontend is NOT the authoritative source of financial/security notifications.
//   Backend domain events → notification creation → target user → realtime delivery.
//
// - Deduplication: use sourceEventId to prevent duplicate notifications
//   from the same backend event arriving twice (e.g. WebSocket reconnect).
//
// - Realtime: this service is prepared to accept future WebSocket events
//   via the addFromRealtimeEvent() method. Do NOT create separate WebSocket
//   connections in individual components — use this centralized layer.
//
// Future API:
//   GET  /api/v1/notifications
//   GET  /api/v1/notifications/unread-count
//   POST /api/v1/notifications/:id/read
//   POST /api/v1/notifications/:id/dismiss
//   POST /api/v1/notifications/read-all

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export type NotificationCategory =
  | 'account' |'security' |'trading' |'kyc' |'finance' |'support' |'programs' |'prediction' |'system' |'dividend';

export type NotificationType =
  | 'deposit_submitted' |'deposit_confirmed' |'deposit_rejected' |'withdrawal_submitted' |'withdrawal_pending' |'withdrawal_approved' |'withdrawal_completed' |'withdrawal_rejected' |'transfer_submitted' |'transfer_completed' |'profile_updated' |'kyc_submitted' |'kyc_approved' |'kyc_rejected' |'kyc_additional_info_required' |'account_activated' |'account_suspended' |'security_login' |'security_password_changed' |'trade_filled' |'trade_cancelled' |'bot_created' |'bot_activated' |'bot_paused' |'bot_stopped' |'bot_failed' |'support_message' |'support_ticket_updated' |'prediction_position_accepted' |'prediction_market_resolved' |'prediction_position_settled' |'program_enrolled' |'dividend_eligible' |'dividend_claim_submitted' |'dividend_paid' |'dividend_rejected' |'system_maintenance' |'system_announcement';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  source?: string;
  /**
   * sourceEventId: unique identifier of the backend domain event that created
   * this notification. Used for deduplication — if the same backend event
   * arrives twice (e.g. WebSocket reconnect), a second notification is NOT created.
   */
  sourceEventId?: string;
  relatedEntity?: string;
  createdAt: string;
  // Per-user state — never global
  readAt: string | null;       // null = unread
  dismissedAt: string | null;  // null = not dismissed from active feed
  // Historical record is ALWAYS retained
}

export interface NotificationFilters {
  status?: 'all' | 'unread' | 'read' | 'dismissed';
  category?: NotificationCategory | 'all';
  severity?: NotificationSeverity | 'all';
  page?: number;
  limit?: number;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
}

const NOTIF_STATE_KEY = 'tc-notification-state-v2';

/**
 * Load persisted read/dismiss state from localStorage.
 * The notifications themselves come from the backend — only per-user
 * interaction state (readAt, dismissedAt) is persisted locally until
 * backend persistence is connected.
 */
function loadPersistedState(): Map<string, { readAt: string | null; dismissedAt: string | null }> {
  if (typeof window === 'undefined') return new Map();
  try {
    const stored = localStorage.getItem(NOTIF_STATE_KEY);
    if (stored) {
      const arr: { id: string; readAt: string | null; dismissedAt: string | null }[] = JSON.parse(stored);
      return new Map(arr.map(item => [item.id, { readAt: item.readAt, dismissedAt: item.dismissedAt }]));
    }
  } catch {}
  return new Map();
}

function savePersistedState(notifications: AppNotification[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const stateOnly = notifications.map(n => ({
      id: n.id,
      readAt: n.readAt,
      dismissedAt: n.dismissedAt,
    }));
    localStorage.setItem(NOTIF_STATE_KEY, JSON.stringify(stateOnly));
  } catch {}
}

// In-memory store — will be replaced by backend API + WebSocket
let _notifications: AppNotification[] = [];
let _initialized = false;

function getStore(): AppNotification[] {
  if (!_initialized) {
    // Restore persisted read/dismiss state for any notifications already in store
    const persisted = loadPersistedState();
    _notifications = _notifications.map(n => {
      const state = persisted.get(n.id);
      if (state) return { ...n, readAt: state.readAt, dismissedAt: state.dismissedAt };
      return n;
    });
    _initialized = true;
  }
  return _notifications;
}

export const notificationService = {
  /**
   * Get all notifications (including dismissed — history is always retained).
   * BACKEND INTEGRATION: GET /api/v1/notifications
   *
   * When backend is connected, replace the in-memory store with API data.
   * The empty default state is intentional — no fake notifications.
   */
  getNotifications(filters?: NotificationFilters): AppNotification[] {
    const all = getStore();
    if (!filters || filters.status === 'all') return all;
    return all.filter(n => {
      if (filters.status === 'unread') return !n.readAt;
      if (filters.status === 'read') return !!n.readAt;
      if (filters.status === 'dismissed') return !!n.dismissedAt;
      return true;
    }).filter(n => {
      if (filters.category && filters.category !== 'all') return n.category === filters.category;
      return true;
    });
  },

  /**
   * Get active (non-dismissed) notifications for the notification feed.
   */
  getActiveNotifications(): AppNotification[] {
    return getStore().filter(n => !n.dismissedAt);
  },

  /**
   * Get unread count (active, non-dismissed unread notifications).
   * BACKEND INTEGRATION: GET /api/v1/notifications/unread-count
   */
  getUnreadCount(): number {
    return getStore().filter(n => !n.readAt && !n.dismissedAt).length;
  },

  /**
   * Mark a notification as read.
   * READ ≠ DISMISSED. History is retained.
   * BACKEND INTEGRATION: POST /api/v1/notifications/:id/read
   */
  markRead(id: string): AppNotification[] {
    _notifications = getStore().map(n =>
      n.id === id && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n
    );
    savePersistedState(_notifications);
    return _notifications;
  },

  /**
   * Mark all active notifications as read.
   * BACKEND INTEGRATION: POST /api/v1/notifications/read-all
   */
  markAllRead(): AppNotification[] {
    const now = new Date().toISOString();
    _notifications = getStore().map(n =>
      !n.readAt ? { ...n, readAt: now } : n
    );
    savePersistedState(_notifications);
    return _notifications;
  },

  /**
   * Dismiss a notification from the active feed.
   * DISMISSED ≠ DELETED. The notification remains in history.
   * BACKEND INTEGRATION: POST /api/v1/notifications/:id/dismiss
   */
  dismiss(id: string): AppNotification[] {
    _notifications = getStore().map(n =>
      n.id === id
        ? {
            ...n,
            dismissedAt: new Date().toISOString(),
            // Auto-mark as read when dismissed
            readAt: n.readAt ?? new Date().toISOString(),
          }
        : n
    );
    savePersistedState(_notifications);
    return _notifications;
  },

  /**
   * Mark a support notification as read when the conversation is opened.
   * Only marks notifications related to the specific conversation.
   * BACKEND INTEGRATION: POST /api/v1/notifications/:id/read
   */
  markSupportNotificationRead(conversationId: string): void {
    _notifications = getStore().map(n =>
      n.type === 'support_message' && n.relatedEntity === conversationId && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n
    );
    savePersistedState(_notifications);
  },

  /**
   * Get unread support notification count.
   */
  getUnreadSupportCount(): number {
    return getStore().filter(n =>
      n.category === 'support' && !n.readAt && !n.dismissedAt
    ).length;
  },

  /**
   * Add a notification from a real customer action outcome.
   *
   * IMPORTANT: Only call this AFTER backend API confirms the action succeeded.
   * Do NOT call this speculatively before API confirmation.
   *
   * Deduplication: if sourceEventId is provided and a notification with the
   * same sourceEventId already exists, the duplicate is silently ignored.
   *
   * Examples of correct usage:
   *   - After PUT /api/v1/me/profile returns 200 → addFromCustomerAction(PROFILE_UPDATED)
   *   - After POST /api/v1/me/deposits returns 201 → addFromCustomerAction(DEPOSIT_SUBMITTED)
   *   - After POST /api/v1/bots returns 201 → addFromCustomerAction(BOT_CREATED)
   *
   * Examples of INCORRECT usage:
   *   - On page load
   *   - On tab change
   *   - On dropdown open
   *   - Before API confirmation
   */
  addFromCustomerAction(notification: Omit<AppNotification, 'readAt' | 'dismissedAt'>): AppNotification[] {
    const store = getStore();

    // Deduplication: prevent duplicate notifications for the same backend event
    if (notification.sourceEventId) {
      const exists = store.some(n => n.sourceEventId === notification.sourceEventId);
      if (exists) return store;
    }

    const newNotification: AppNotification = {
      ...notification,
      readAt: null,
      dismissedAt: null,
    };

    _notifications = [newNotification, ...store];
    savePersistedState(_notifications);
    return _notifications;
  },

  /**
   * Accept a notification from a realtime WebSocket event.
   *
   * Conceptual flow:
   *   WS event → notification service → query/cache update → bell badge → notification page
   *
   * This is the single centralized realtime entry point.
   * Do NOT create separate WebSocket connections in individual components.
   *
   * Deduplication is applied using sourceEventId.
   *
   * BACKEND INTEGRATION: Connect to WS channel when backend is ready.
   */
  addFromRealtimeEvent(notification: Omit<AppNotification, 'readAt' | 'dismissedAt'>): AppNotification[] {
    return this.addFromCustomerAction(notification);
  },

  /**
   * Replace the entire notification store with data from the backend API.
   * Merges persisted read/dismiss state with server data.
   * BACKEND INTEGRATION: Call after GET /api/v1/notifications
   */
  hydrateFromBackend(serverNotifications: Omit<AppNotification, 'readAt' | 'dismissedAt'>[]): AppNotification[] {
    const persisted = loadPersistedState();
    _notifications = serverNotifications.map(n => {
      const state = persisted.get(n.id);
      return {
        ...n,
        readAt: state?.readAt ?? null,
        dismissedAt: state?.dismissedAt ?? null,
      };
    });
    _initialized = true;
    return _notifications;
  },
};

// Legacy email notification types — kept for backward compatibility
export type EmailNotificationType =
  | 'deposit_confirmed' |'withdrawal_pending' |'withdrawal_approved' |'withdrawal_rejected' |'profile_updated' |'kyc_approved' |'kyc_rejected' |'account_activated' |'account_suspended';

export interface EmailNotificationPayload {
  customerId: string;
  customerEmail: string;
  customerName: string;
  type: EmailNotificationType;
  data?: Record<string, string | number>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: EmailNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
