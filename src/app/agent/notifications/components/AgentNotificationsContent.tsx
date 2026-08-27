'use client';
import React from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';

const NOTIFICATIONS = [
  { id: 'n-001', title: 'New Customer Assigned', message: 'Thomas Bergmann has been assigned to you', time: '2026-08-27 18:00', read: false, type: 'assignment' },
  { id: 'n-002', title: 'Task Overdue', message: 'Review registration for Priya Sharma is overdue', time: '2026-08-27 16:00', read: false, type: 'task' },
  { id: 'n-003', title: 'New Message', message: 'Alex Morgan sent you a message', time: '2026-08-27 14:32', read: true, type: 'message' },
  { id: 'n-004', title: 'Call Reminder', message: 'Follow-up call with Aisha Al-Rashidi due today', time: '2026-08-27 09:00', read: true, type: 'call' },
];

const TYPE_COLORS: Record<string, string> = { assignment: '#F5C400', task: '#ef4444', message: '#3b82f6', call: '#22c55e' };

export default function AgentNotificationsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle={`${NOTIFICATIONS.filter(n => !n.read).length} unread`} />
      <Card padding="p-0">
        {NOTIFICATIONS.map(n => (
          <div key={n.id} className="flex items-start gap-3 p-3 border-b hover:bg-white/3 transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}>
            <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: TYPE_COLORS[n.type] }} />
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{n.title}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
              <p className="text-xs mt-0.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: 'var(--primary)' }} />}
          </div>
        ))}
      </Card>
    </div>
  );
}
