// NOTIFICATION SERVICE
// Frontend abstraction for the platform-wide notification system.
// Handles in-app notifications with read/dismiss distinction.
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
// Future API:
//   GET  /api/v1/notifications
//   GET  /api/v1/notifications/unread-count
//   POST /api/v1/notifications/:id/read
//   POST /api/v1/notifications/:id/dismiss
//   POST /api/v1/notifications/read-all

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';
export type NotificationCategory =
  | 'account' |'security' |'trading' |'kyc' |'finance' |'support' |'system' |'dividend';

export type NotificationType =
  | 'deposit_confirmed' |'withdrawal_pending' |'withdrawal_approved' |'withdrawal_rejected' |'profile_updated' |'kyc_approved' |'kyc_rejected' |'kyc_submitted' |'account_activated' |'account_suspended' |'security_login' |'security_password_changed' |'trade_filled' |'trade_cancelled' |'support_message' |'support_ticket_updated' |'dividend_eligible' |'dividend_paid' |'dividend_rejected' |'system_maintenance' |'system_announcement';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  source?: string;
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

const NOTIF_STATE_KEY = 'tc-notification-state';

// Mock notifications — represent what the backend will return
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    userId: 'cust-001',
    type: 'deposit_confirmed',
    category: 'finance',
    severity: 'success',
    title: 'Deposit Confirmed',
    message: '$2,500 USDC deposit has been confirmed and credited to your account.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
  },
  {
    id: 'notif-002',
    userId: 'cust-001',
    type: 'kyc_submitted',
    category: 'kyc',
    severity: 'info',
    title: 'KYC Documents Submitted',
    message: 'Your identity documents are under review. This usually takes 24–48 hours.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
  },
  {
    id: 'notif-003',
    userId: 'cust-001',
    type: 'withdrawal_pending',
    category: 'finance',
    severity: 'warning',
    title: 'Withdrawal Processing',
    message: 'Your withdrawal of $500 USDC is being processed. Expected: 1–3 business days.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
  },
  {
    id: 'notif-004',
    userId: 'cust-001',
    type: 'trade_filled',
    category: 'trading',
    severity: 'success',
    title: 'Order Filled',
    message: 'Buy order for 0.05 BTC at $67,842 has been fully filled.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    dismissedAt: null,
  },
  {
    id: 'notif-005',
    userId: 'cust-001',
    type: 'kyc_approved',
    category: 'kyc',
    severity: 'success',
    title: 'Identity Verified',
    message: 'Your KYC verification is complete. Full trading access is now enabled.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    dismissedAt: null,
  },
  {
    id: 'notif-006',
    userId: 'cust-001',
    type: 'security_login',
    category: 'security',
    severity: 'warning',
    title: 'New Login Detected',
    message: 'New login detected from Chrome on Windows. If this was not you, secure your account immediately.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
  },
  {
    id: 'notif-007',
    userId: 'cust-001',
    type: 'support_message',
    category: 'support',
    severity: 'info',
    title: 'Support Reply',
    message: 'Your support agent has replied to your conversation.',
    source: 'support',
    relatedEntity: 'conv-001',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
  },
];

function loadState(): AppNotification[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const stored = localStorage.getItem(NOTIF_STATE_KEY);
    if (stored) {
      const parsed: AppNotification[] = JSON.parse(stored);
      // Merge stored state (read/dismiss) with initial notifications
      return INITIAL_NOTIFICATIONS.map(n => {
        const stored_n = parsed.find(p => p.id === n.id);
        if (stored_n) {
          return { ...n, readAt: stored_n.readAt, dismissedAt: stored_n.dismissedAt };
        }
        return n;
      });
    }
  } catch {}
  return INITIAL_NOTIFICATIONS;
}

function saveState(notifications: AppNotification[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // Only persist the per-user state fields (readAt, dismissedAt)
    const stateOnly = notifications.map(n => ({
      id: n.id,
      readAt: n.readAt,
      dismissedAt: n.dismissedAt,
    }));
    localStorage.setItem(NOTIF_STATE_KEY, JSON.stringify(stateOnly));
  } catch {}
}

export const notificationService = {
  /**
   * Get all notifications (including dismissed — history is always retained).
   * BACKEND INTEGRATION: GET /api/v1/notifications
   */
  getNotifications(filters?: NotificationFilters): AppNotification[] {
    const all = loadState();
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
    return loadState().filter(n => !n.dismissedAt);
  },

  /**
   * Get unread count (active, non-dismissed unread notifications).
   * BACKEND INTEGRATION: GET /api/v1/notifications/unread-count
   */
  getUnreadCount(): number {
    return loadState().filter(n => !n.readAt && !n.dismissedAt).length;
  },

  /**
   * Mark a notification as read.
   * READ ≠ DISMISSED. History is retained.
   * BACKEND INTEGRATION: POST /api/v1/notifications/:id/read
   */
  markRead(id: string): AppNotification[] {
    const notifications = loadState().map(n =>
      n.id === id && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n
    );
    saveState(notifications);
    return notifications;
  },

  /**
   * Mark all active notifications as read.
   * BACKEND INTEGRATION: POST /api/v1/notifications/read-all
   */
  markAllRead(): AppNotification[] {
    const now = new Date().toISOString();
    const notifications = loadState().map(n =>
      !n.readAt ? { ...n, readAt: now } : n
    );
    saveState(notifications);
    return notifications;
  },

  /**
   * Dismiss a notification from the active feed.
   * DISMISSED ≠ DELETED. The notification remains in history.
   * BACKEND INTEGRATION: POST /api/v1/notifications/:id/dismiss
   */
  dismiss(id: string): AppNotification[] {
    const notifications = loadState().map(n =>
      n.id === id
        ? {
            ...n,
            dismissedAt: new Date().toISOString(),
            // Auto-mark as read when dismissed
            readAt: n.readAt ?? new Date().toISOString(),
          }
        : n
    );
    saveState(notifications);
    return notifications;
  },

  /**
   * Mark a support notification as read when the conversation is opened.
   * Prevents the same support message from appearing as new after being read.
   */
  markSupportNotificationRead(conversationId: string): void {
    const notifications = loadState().map(n =>
      n.type === 'support_message' && n.relatedEntity === conversationId && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n
    );
    saveState(notifications);
  },

  /**
   * Get unread support notification count.
   */
  getUnreadSupportCount(): number {
    return loadState().filter(n =>
      n.category === 'support' && !n.readAt && !n.dismissedAt
    ).length;
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
