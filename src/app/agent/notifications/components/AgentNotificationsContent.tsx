'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';
import { UserPlus, MessageSquare, ClipboardList, PhoneCall, Bell } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'assignment' | 'task' | 'message' | 'call' | 'system';
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 'n-001', title: 'New Customer Assigned', message: 'Thomas Bergmann has been assigned to you', time: '2026-08-27 18:00', read: false, type: 'assignment' },
  { id: 'n-002', title: 'Task Overdue', message: 'Review registration for Priya Sharma is overdue', time: '2026-08-27 16:00', read: false, type: 'task' },
  { id: 'n-003', title: 'New Message', message: 'Alex Morgan sent you a message', time: '2026-08-27 14:32', read: false, type: 'message' },
  { id: 'n-004', title: 'Call Reminder', message: 'Follow-up call with Aisha Al-Rashidi due today', time: '2026-08-27 09:00', read: false, type: 'call' },
  { id: 'n-005', title: 'New Lead Assigned', message: 'Carlos Mendez from Mexico has been assigned to you', time: '2026-08-26 17:00', read: true, type: 'assignment' },
  { id: 'n-006', title: 'Task Completed', message: 'KYC review for David Kim marked as complete', time: '2026-08-26 12:00', read: true, type: 'task' },
];

const TYPE_COLORS: Record<string, string> = {
  assignment: '#F5C400', task: '#ef4444', message: '#3b82f6', call: '#22c55e', system: '#6b7280'
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  assignment: UserPlus, task: ClipboardList, message: MessageSquare, call: PhoneCall, system: Bell
};

const STORAGE_KEY = 'cv-agent-page-notifs';

export default function AgentNotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const readIds: string[] = JSON.parse(saved);
          setNotifications(DEFAULT_NOTIFICATIONS.map(n => ({ ...n, read: readIds.includes(n.id) ? true : n.read })));
        }
      } catch {}
    }
  }, []);

  const persist = (notifs: Notification[]) => {
    if (typeof localStorage !== 'undefined') {
      const readIds = notifs.filter(n => n.read).map(n => n.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }
  };

  const markRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persist(next);
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Notifications" subtitle={unread > 0 ? `${unread} unread` : 'All caught up'} />
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
          >
            Mark all read
          </button>
        )}
      </div>
      <Card padding="p-0">
        {notifications.map(n => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          return (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`flex items-start gap-3 p-3 border-b transition-colors ${!n.read ? 'cursor-pointer hover:bg-white/5' : ''}`}
              style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${TYPE_COLORS[n.type]}18` }}
              >
                <Icon size={12} style={{ color: TYPE_COLORS[n.type] }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                <p className="text-xs mt-0.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
              </div>
              {!n.read && (
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                  <button
                    onClick={e => { e.stopPropagation(); markRead(n.id); }}
                    className="text-xs px-2 py-0.5 rounded transition-colors hover:bg-white/10"
                    style={{ color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.3)' }}
                  >
                    Mark read
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="py-12 text-center">
            <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No notifications</p>
          </div>
        )}
      </Card>
    </div>
  );
}
