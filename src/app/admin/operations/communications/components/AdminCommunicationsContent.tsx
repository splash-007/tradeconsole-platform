'use client';
import React, { useEffect, useState } from 'react';
import { chatService, Conversation } from '@/services/chat.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

export default function AdminCommunicationsContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { chatService.getConversations().then(d => { setConversations(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Communications" subtitle="All customer-agent conversations" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Conversations" value={conversations.filter(c => c.status === 'active').length} />
        <KpiCard label="Unread Messages" value={conversations.reduce((s, c) => s + c.unreadCount, 0)} />
        <KpiCard label="Online Customers" value={conversations.filter(c => c.customerOnline).length} />
        <KpiCard label="Total Conversations" value={conversations.length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            {
              key: 'customerName', label: 'Customer',
              render: (c: Conversation) => (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.customerOnline ? '#22c55e' : '#6b7280' }} />
                  <span style={{ color: 'var(--foreground)' }}>{c.customerName}</span>
                </div>
              )
            },
            { key: 'agentName', label: 'Assigned Agent' },
            { key: 'status', label: 'Status', render: (c: Conversation) => <StatusBadge status={c.status} /> },
            { key: 'lastMessage', label: 'Last Message', render: (c: Conversation) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{c.lastMessage}</span> },
            { key: 'unreadCount', label: 'Unread', render: (c: Conversation) => (
              <span style={{ color: c.unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>{c.unreadCount}</span>
            )},
            { key: 'lastActivity', label: 'Last Activity' },
          ]}
          data={conversations}
          loading={loading}
        />
      </Card>
    </div>
  );
}
