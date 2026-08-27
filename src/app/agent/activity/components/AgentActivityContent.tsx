'use client';
import React from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';

const ACTIVITY = [
  { id: 'a-001', time: '14:40', event: 'Opened customer profile', customer: 'Alex Morgan', type: 'view' },
  { id: 'a-002', time: '14:05', event: 'Call completed (4:32)', customer: 'Alex Morgan', type: 'call' },
  { id: 'a-003', time: '14:28', event: 'Internal note added', customer: 'Alex Morgan', type: 'note' },
  { id: 'a-004', time: '14:34', event: 'Message sent', customer: 'Alex Morgan', type: 'message' },
  { id: 'a-005', time: '09:00', event: 'Call completed (2:15)', customer: 'Aisha Al-Rashidi', type: 'call' },
  { id: 'a-006', time: '08:30', event: 'Task status updated to In Progress', customer: 'Aisha Al-Rashidi', type: 'task' },
];

const TYPE_COLORS: Record<string, string> = { view: '#6b7280', call: '#22c55e', note: '#F5C400', message: '#3b82f6', task: '#f59e0b' };

export default function AgentActivityContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Activity" subtitle="Your recent activity log" />
      <Card>
        <div className="space-y-3">
          {ACTIVITY.map(a => (
            <div key={a.id} className="flex gap-3 text-xs items-start">
              <span className="shrink-0 font-mono w-12" style={{ color: 'var(--primary)' }}>{a.time}</span>
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: TYPE_COLORS[a.type] }} />
              <div className="flex-1 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--foreground)' }}>{a.event}</span>
                <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>· {a.customer}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
