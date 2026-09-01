'use client';
import React, { useState, useEffect } from 'react';

import { Bell, Check, CheckCheck, X, Search, DollarSign, TrendingUp, Shield, AlertCircle, MessageSquare, Settings, Star, Info } from 'lucide-react';
import { notificationService, AppNotification, NotificationCategory, NotificationSeverity } from '@/services/notification.service';

type FilterStatus = 'all' | 'unread' | 'read' | 'dismissed';
type FilterCategory = NotificationCategory | 'all';

const CATEGORY_COLORS: Record<string, string> = {
  finance: '#22c55e', trading: '#F5C400', kyc: '#3b82f6',
  security: '#ef4444', support: '#8b5cf6', account: '#06b6d4',
  system: '#6b7280', dividend: '#f59e0b',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  finance: DollarSign, trading: TrendingUp, kyc: Shield,
  security: AlertCircle, support: MessageSquare, account: Settings,
  system: AlertCircle, dividend: Star,
};

const SEVERITY_STYLES: Record<NotificationSeverity, { color: string; bg: string; label: string }> = {
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Info' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Success' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Warning' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load ALL notifications including dismissed (history is always retained)
    setNotifications(notificationService.getNotifications({ status: 'all' }));
  }, []);

  const handleMarkRead = (id: string) => {
    const updated = notificationService.markRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllRead();
    setNotifications(updated);
  };

  const handleDismiss = (id: string) => {
    // DISMISSED ≠ DELETED — notification remains in history with dismissedAt set
    const updated = notificationService.dismiss(id);
    setNotifications(updated);
  };

  const filtered = notifications.filter(n => {
    if (filterStatus === 'unread' && n.readAt) return false;
    if (filterStatus === 'read' && !n.readAt) return false;
    if (filterStatus === 'dismissed' && !n.dismissedAt) return false;
    if (filterCategory !== 'all' && n.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;

  const CATEGORIES: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'account', label: 'Account' },
    { value: 'security', label: 'Security' },
    { value: 'trading', label: 'Trading' },
    { value: 'kyc', label: 'KYC' },
    { value: 'finance', label: 'Finance' },
    { value: 'support', label: 'Support' },
    { value: 'dividend', label: 'Dividend' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="py-4 max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Notifications</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
            {' · '}Dismissed items remain in history
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium transition-all hover:bg-muted shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Status filter */}
        <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {(['all', 'unread', 'read', 'dismissed'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-colors border-r last:border-r-0"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: filterStatus === s ? 'var(--primary)' : 'var(--card)',
                color: filterStatus === s ? '#000' : 'var(--muted-foreground)',
              }}
            >
              {s}
              {s === 'unread' && unreadCount > 0 && (
                <span className="ml-1 px-1 rounded-full text-xs" style={{ backgroundColor: filterStatus === s ? 'rgba(0,0,0,0.2)' : 'var(--negative)', color: '#fff', fontSize: '9px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as FilterCategory)}
          className="px-3 py-1.5 text-xs rounded border focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border focus:outline-none"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Notification list */}
      <div className="rounded border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={24} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No notifications found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {filterStatus === 'dismissed' ? 'No dismissed notifications in history.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          filtered.map((n, idx) => {
            const NIcon = CATEGORY_ICONS[n.category] || Bell;
            const color = CATEGORY_COLORS[n.category] || '#6b7280';
            const sevStyle = SEVERITY_STYLES[n.severity];
            const isDismissed = !!n.dismissedAt;
            const isRead = !!n.readAt;

            return (
              <div
                key={n.id}
                className="group flex items-start gap-3 px-4 py-3.5 border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: !isRead && !isDismissed ? 'rgba(212,168,0,0.03)' : isDismissed ? 'rgba(107,114,128,0.03)' : 'transparent',
                  opacity: isDismissed ? 0.65 : 1,
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}18` }}>
                  <NIcon size={14} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                      {!isRead && !isDismissed && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary)' }} />}
                      {isDismissed && <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }}>Dismissed</span>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isRead && !isDismissed && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-all hover:bg-muted"
                          style={{ color: 'var(--primary)' }}
                          title="Mark as read"
                        >
                          <Check size={10} /> Read
                        </button>
                      )}
                      {!isDismissed && (
                        <button
                          onClick={() => handleDismiss(n.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:bg-muted"
                          style={{ color: 'var(--muted-foreground)' }}
                          title="Dismiss from feed (history retained)"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs opacity-60" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(n.createdAt)}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: `${color}15`, color }}>
                      {n.category}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}>
                      {sevStyle.label}
                    </span>
                    {isRead && !isDismissed && (
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Read {n.readAt ? timeAgo(n.readAt) : ''}
                      </span>
                    )}
                    {isDismissed && (
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Dismissed {n.dismissedAt ? timeAgo(n.dismissedAt) : ''} · History retained
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info note */}
      <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded border" style={{ backgroundColor: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
        <Info size={12} className="mt-0.5 shrink-0" style={{ color: '#3b82f6' }} />
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <strong style={{ color: 'var(--foreground)' }}>Read ≠ Dismissed.</strong> Marking a notification as read records that you have seen it. Dismissing removes it from your active feed but the historical record is always retained. Notification state is per-user — your read/dismiss actions do not affect other users.
        </p>
      </div>
    </div>
  );
}
