'use client';
import React, { useEffect, useState } from 'react';
import { chatService, Conversation, ChatMessage } from '@/services/chat.service';
import { PageHeader, Card, ActionButton } from '@/components/admin/AdminUI';

const AGENT_ID = 'agent-001';
const ONLINE_DOT: Record<string, string> = { true: '#22c55e', false: '#6b7280' };

export default function AgentMessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getConversations(AGENT_ID).then(d => { setConversations(d); setLoading(false); });
  }, []);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);
    const msgs = await chatService.getMessages(conv.id, false);
    setMessages(msgs);
    await chatService.markAsRead(conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected) return;
    const msg = await chatService.sendMessage(selected.id, newMessage, false);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" subtitle="Customer conversations" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <Card padding="p-0" className="overflow-y-auto">
          {loading ? (
            <div className="p-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>Loading...</div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => openConversation(conv)}
                className="w-full text-left p-3 border-b hover:bg-white/3 transition-colors"
                style={{ borderColor: 'var(--border)', backgroundColor: selected?.id === conv.id ? 'rgba(245,196,0,0.05)' : 'transparent' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ONLINE_DOT[String(conv.customerOnline)] }} />
                  <span className="text-xs font-medium flex-1" style={{ color: 'var(--foreground)' }}>{conv.customerName}</span>
                  {conv.unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>{conv.unreadCount}</span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{conv.lastMessage}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{conv.lastActivity}</p>
              </button>
            ))
          )}
        </Card>

        {/* Message thread */}
        <div className="md:col-span-2">
          {selected ? (
            <Card padding="p-0" className="flex flex-col h-full">
              <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ONLINE_DOT[String(selected.customerOnline)] }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{selected.customerName}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selected.customerOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'customer' ? 'items-start' : 'items-end'}`}>
                    <div className="max-w-xs px-3 py-2 rounded text-xs"
                      style={{ backgroundColor: msg.senderRole === 'customer' ? 'var(--muted)' : 'rgba(245,196,0,0.1)' }}>
                      <p className="font-semibold mb-0.5" style={{ color: msg.senderRole === 'customer' ? 'var(--foreground)' : 'var(--primary)' }}>{msg.senderName}</p>
                      <p style={{ color: 'var(--foreground)' }}>{msg.content}</p>
                      <div className="flex items-center gap-1 mt-1 opacity-60">
                        <span>{msg.timestamp}</span>
                        {msg.senderRole === 'agent' && <span>{msg.read ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message to customer..."
                  className="flex-1 text-xs px-3 py-2 rounded border outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <ActionButton variant="primary" onClick={sendMessage}>Send</ActionButton>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Select a conversation to view messages</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
