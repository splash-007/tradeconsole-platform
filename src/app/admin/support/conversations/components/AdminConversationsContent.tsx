'use client';
import React, { useEffect, useState } from 'react';
import { chatService, Conversation, ChatMessage } from '@/services/chat.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

export default function AdminConversationsContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getConversations().then(d => { setConversations(d); setLoading(false); });
  }, []);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);
    // Admin can see all messages including internal notes
    const msgs = await chatService.getMessages(conv.id, true);
    setMessages(msgs);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Conversations" subtitle="Admin oversight of all customer-agent conversations" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active" value={conversations.filter(c => c.status === 'active').length} />
        <KpiCard label="Unread" value={conversations.reduce((s, c) => s + c.unreadCount, 0)} />
        <KpiCard label="Online Customers" value={conversations.filter(c => c.customerOnline).length} />
        <KpiCard label="Total" value={conversations.length} />
      </div>

      {selected ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{selected.customerName}</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Assigned to {selected.agentName} · Conversation {selected.id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>← Back</button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'customer' ? 'items-start' : 'items-end'}`}>
                {msg.isInternal ? (
                  <div className="max-w-md px-3 py-2 rounded border text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.05)', borderColor: 'rgba(245,196,0,0.3)', color: 'var(--muted-foreground)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>🔒 Internal Note — {msg.senderName}</p>
                    {msg.content}
                    <p className="text-xs mt-1 opacity-60">{msg.timestamp}</p>
                  </div>
                ) : (
                  <div className="max-w-md px-3 py-2 rounded text-xs" style={{ backgroundColor: msg.senderRole === 'customer' ? 'var(--muted)' : 'rgba(245,196,0,0.1)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: msg.senderRole === 'customer' ? 'var(--foreground)' : 'var(--primary)' }}>{msg.senderName}</p>
                    <p style={{ color: 'var(--foreground)' }}>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">{msg.timestamp}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
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
              { key: 'agentName', label: 'Agent' },
              { key: 'status', label: 'Status', render: (c: Conversation) => <StatusBadge status={c.status} /> },
              { key: 'lastMessage', label: 'Last Message', render: (c: Conversation) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{c.lastMessage}</span> },
              { key: 'unreadCount', label: 'Unread', render: (c: Conversation) => <span style={{ color: c.unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>{c.unreadCount}</span> },
              { key: 'lastActivity', label: 'Last Activity' },
              { key: 'actions', label: '', render: (c: Conversation) => <button onClick={() => openConversation(c)} className="text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>View Thread</button> },
            ]}
            data={conversations}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
}
