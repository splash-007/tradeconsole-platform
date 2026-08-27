'use client';
import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone } from 'lucide-react';

interface Conversation {
  id: string;
  agentName: string;
  agentInitial: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  away?: boolean;
}

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  time: string;
  read: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: 'c1', agentName: 'Sarah Chen', agentInitial: 'S', lastMessage: 'I have reviewed your account and everything looks good.', time: '14:32', unread: 0, online: true },
  { id: 'c2', agentName: 'Support Team', agentInitial: 'ST', lastMessage: 'Your deposit has been confirmed.', time: '11:15', unread: 2, online: true },
  { id: 'c3', agentName: 'Michael Torres', agentInitial: 'M', lastMessage: 'Please provide your verification documents.', time: 'Yesterday', unread: 0, online: false, away: true },
];

const MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1', sender: 'agent', text: 'Hello! How can I assist you today?', time: '14:20', read: true },
    { id: 'm2', sender: 'customer', text: 'Hi Sarah, I have a question about my account balance.', time: '14:22', read: true },
    { id: 'm3', sender: 'agent', text: 'Of course! I can see your account. What specifically would you like to know?', time: '14:24', read: true },
    { id: 'm4', sender: 'customer', text: 'Can you check my recent deposit status?', time: '14:28', read: true },
    { id: 'm5', sender: 'agent', text: 'I have reviewed your account and everything looks good. Your deposit of $5,000 was processed successfully on Aug 26.', time: '14:32', read: true },
  ],
  c2: [
    { id: 'm1', sender: 'agent', text: 'Your deposit has been confirmed.', time: '11:15', read: false },
    { id: 'm2', sender: 'agent', text: 'Funds should be available in your account within 1 business day.', time: '11:15', read: false },
  ],
  c3: [
    { id: 'm1', sender: 'agent', text: 'Please provide your verification documents to complete KYC.', time: 'Yesterday', read: true },
  ],
};

export default function MessagesContent() {
  const [selectedConv, setSelectedConv] = useState<string>('c1');
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState(MESSAGES);

  const conv = CONVERSATIONS.find(c => c.id === selectedConv);
  const currentMessages = messages[selectedConv] || [];

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: 'customer',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      read: false,
    };
    setMessages(prev => ({ ...prev, [selectedConv]: [...(prev[selectedConv] || []), newMsg] }));
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = CONVERSATIONS.filter(c =>
    c.agentName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (c: Conversation) => {
    if (c.online) return '#22c55e';
    if (c.away) return '#F5C400';
    return '#6b7280';
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Messages</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Chat with your assigned support agent</p>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden flex" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', height: '600px' }}>
        {/* Conversation list */}
        <div className="w-72 shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border)' }}>
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded text-xs border focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredConvs.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedConv(c.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 border-b ${selectedConv === c.id ? 'bg-primary-subtle' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                    {c.agentInitial}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                    style={{ backgroundColor: getStatusColor(c), borderColor: 'var(--card)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate" style={{ color: selectedConv === c.id ? 'var(--primary)' : 'var(--foreground)' }}>{c.agentName}</span>
                    <span className="text-xs shrink-0 ml-1" style={{ color: 'var(--muted-foreground)' }}>{c.time}</span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {conv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {conv.agentInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border"
                  style={{ backgroundColor: getStatusColor(conv), borderColor: 'var(--card)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{conv.agentName}</p>
                <p className="text-xs" style={{ color: conv.online ? 'var(--positive)' : 'var(--muted-foreground)' }}>
                  {conv.online ? 'Online' : conv.away ? 'Away' : 'Offline'}
                </p>
              </div>
              <div className="flex-1" />
              <button className="p-2 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <Phone size={15} />
              </button>
              <button className="p-2 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <MoreVertical size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'agent' && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1"
                      style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                      {conv.agentInitial.slice(0, 1)}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md`}>
                    <div
                      className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                      style={{
                        backgroundColor: msg.sender === 'customer' ? 'var(--primary)' : 'var(--muted)',
                        color: msg.sender === 'customer' ? '#000' : 'var(--foreground)',
                        borderRadius: msg.sender === 'customer' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      }}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-right' : ''}`} style={{ color: 'var(--muted-foreground)' }}>
                      {msg.time}
                      {msg.sender === 'customer' && (
                        <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-end gap-2">
                <button className="p-2 rounded hover:bg-muted transition-colors shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  <Paperclip size={15} />
                </button>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-3 py-2 rounded-lg text-xs border focus:outline-none resize-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', minHeight: '36px', maxHeight: '100px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg transition-all active:scale-95 disabled:opacity-40 shrink-0"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
