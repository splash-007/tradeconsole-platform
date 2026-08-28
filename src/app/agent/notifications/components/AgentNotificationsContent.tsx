'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';
import { UserPlus, MessageSquare, ClipboardList, PhoneCall, Bell, DollarSign, ShieldCheck } from 'lucide-react';
import { platformService, PlatformNotification } from '@/services/platform.service';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


const RECIPIENT_ID = 'broker-001';

const TYPE_COLORS: Record<string, string> = {
  assignment: '#F5C400',
  task: '#ef4444',
  message: '#3b82f6',
  call: '#22c55e',
  system: '#6b7280',
  finance: '#22c55e',
  compliance: '#a855f7',
  escalation: '#ef4444',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  assignment: UserPlus,
  task: ClipboardList,
  message: MessageSquare,
  call: PhoneCall,
  system: Bell,
  finance: DollarSign,
  compliance: ShieldCheck,
  escalation: Bell,
};

export default function AgentNotificationsContent() {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformService.getNotifications(RECIPIENT_ID).then(d => {
      setNotifications(d);
      setLoading(false);
    });
  }, []);

  // Subscribe to new notifications
  useEffect(() => {
    const unsub = platformService.subscribe(event => {
      if (event.type === 'notification_created') {
        const notif = event.payload as PlatformNotification;
        if (notif.recipientId === RECIPIENT_ID) {
          setNotifications(prev => [notif, ...prev]);
        }
      }
    });
    return unsub;
  }, []);

  const markRead = async (id: string) => {
    await platformService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => platformService.markNotificationRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-12 rounded" style={{ backgroundColor: 'var(--muted)' }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No notifications</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const content = (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 border-b transition-colors ${!n.read ? 'cursor-pointer hover:bg-white/5' : ''}`}
                style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${TYPE_COLORS[n.type] || '#6b7280'}18` }}>
                  <Icon size={12} style={{ color: TYPE_COLORS[n.type] || '#6b7280' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                  {n.customerName && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>Customer: {n.customerName}</p>
                  )}
                  <p className="text-xs mt-0.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{n.createdAt}</p>
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

            return n.linkHref ? (
              <Link key={n.id} href={n.linkHref} className="block">{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })
        )}
      </Card>
    </div>
  );
}
