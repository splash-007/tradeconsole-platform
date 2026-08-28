'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { MessageSquare, Search, Send, ArrowLeft, Users, User, Hash, Sun, Moon } from 'lucide-react';
import { staffChatService, type Conversation, type ChatMessage, type PresenceStatus } from '@/services/staff-chat.service';

const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#6b7280',
};

const CONV_TYPE_ICONS: Record<string, React.ElementType> = {
  direct: User, team: Users, department: Hash,
};

export default function StaffChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    staffChatService.getConversations().then(setConversations);
  }, []);

  useEffect(() => {
    if (activeConv) {
      staffChatService.getMessages(activeConv.id).then(setMessages);
      staffChatService.markAsRead(activeConv.id);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, unreadCount: 0 } : c));
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cv-theme') : null;
    const dark = saved !== 'light';
    setIsDark(dark);
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('light', !dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('light', !next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('cv-theme', next ? 'dark' : 'light');
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const msg = await staffChatService.sendMessage(activeConv.id, input.trim());
    setMessages(prev => [...prev, msg]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setMobileView('chat');
  };

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top bar */}
      <header className="h-12 border-b flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={22} />
          <span className="text-xs font-bold hidden sm:block" style={{ color: 'var(--primary)' }}>CryptoVault</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.08)' }}>
          <MessageSquare size={12} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Internal Chat</span>
          {totalUnread > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff' }}>{totalUnread}</span>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="p-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Link href="javascript:history.back()" className="text-xs px-3 py-1.5 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          ← Back
        </Link>
      </header>

      {/* Chat layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} md:flex flex-col border-r shrink-0`}
          style={{ width: '280px', backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border focus:outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredConvs.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No conversations found</p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const TypeIcon = CONV_TYPE_ICONS[conv.type] || User;
                const isActive = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 border-b"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: isActive ? 'rgba(245,196,0,0.08)' : undefined,
                    }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: isActive ? 'rgba(245,196,0,0.2)' : 'rgba(255,255,255,0.06)' }}>
                        <TypeIcon size={15} style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                      </div>
                      {conv.presenceStatus && conv.type === 'direct' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: PRESENCE_COLORS[conv.presenceStatus], borderColor: 'var(--card)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold truncate" style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>{conv.name}</p>
                        {conv.lastMessageAt && <span className="text-xs shrink-0 ml-1" style={{ color: 'var(--muted-foreground)' }}>{conv.lastMessageAt}</span>}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{conv.lastMessage}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:flex flex-1 flex-col min-w-0`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="h-12 border-b flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <button
                  className="md:hidden p-1.5 rounded hover:bg-white/5"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => setMobileView('list')}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="relative">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
                    {React.createElement(CONV_TYPE_ICONS[activeConv.type] || User, { size: 13, style: { color: 'var(--primary)' } })}
                  </div>
                  {activeConv.presenceStatus && activeConv.type === 'direct' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border" style={{ backgroundColor: PRESENCE_COLORS[activeConv.presenceStatus], borderColor: 'var(--card)' }} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{activeConv.name}</p>
                  {activeConv.presenceStatus && (
                    <p className="text-xs capitalize" style={{ color: PRESENCE_COLORS[activeConv.presenceStatus] }}>
                      {activeConv.presenceStatus}
                    </p>
                  )}
                  {activeConv.type !== 'direct' && (
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {activeConv.participantNames.length} members
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === 'current-user';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                            {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {!isMe && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{msg.senderName}</span>
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{msg.senderRole}</span>
                            </div>
                          )}
                          <div
                            className="px-3 py-2 rounded-2xl text-xs leading-relaxed"
                            style={{
                              backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                              color: isMe ? '#000' : 'var(--foreground)',
                              borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            }}
                          >
                            {msg.content}
                          </div>
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.1)' }}>
                <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Internal Staff Chat</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
