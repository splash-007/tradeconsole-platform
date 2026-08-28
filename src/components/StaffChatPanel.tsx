'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, Send, ArrowLeft, Users, User, Hash, X, Maximize2, Circle } from 'lucide-react';
import {
  staffChatService,
  type Conversation,
  type ChatMessage,
  type PresenceStatus,
} from '@/services/staff-chat.service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StaffChatPanelProps {
  /** Render as a floating panel (default) or inline full-height */
  mode?: 'floating' | 'inline';
  /** Pre-open a specific conversation by ID */
  initialConversationId?: string;
  /** Called when the panel is closed (floating mode) */
  onClose?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: '#22c55e',
  away: '#f59e0b',
  busy: '#ef4444',
  offline: '#6b7280',
};

const CONV_TYPE_ICONS: Record<string, React.ElementType> = {
  direct: User,
  team: Users,
  department: Hash,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1
    ? `${names[0]} is typing`
    : `${names.slice(0, 2).join(', ')} are typing`;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--primary)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}…</span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.senderId === 'current-user';
  return (
    <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}
        >
          {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{msg.senderName}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{msg.senderRole}</span>
          </div>
        )}
        <div
          className="px-3 py-2 text-xs leading-relaxed"
          style={{
            backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
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
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StaffChatPanel({
  mode = 'floating',
  initialConversationId,
  onClose,
}: StaffChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load conversations ──
  useEffect(() => {
    staffChatService.getConversations().then(convs => {
      setConversations(convs);
      setTotalUnread(convs.reduce((s, c) => s + c.unreadCount, 0));
      if (initialConversationId) {
        const target = convs.find(c => c.id === initialConversationId);
        if (target) openConversation(target);
      }
    });
  }, [initialConversationId]);

  // ── Real-time: new messages ──
  useEffect(() => {
    const unsub = staffChatService.onNewMessage((msg) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages(prev => [...prev, msg]);
      }
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg.content, lastMessageAt: 'just now', unreadCount: activeConv?.id === c.id ? 0 : c.unreadCount + 1 }
          : c
      ));
      setTotalUnread(staffChatService.getTotalUnread());
    });
    return unsub;
  }, [activeConv]);

  // ── Real-time: typing ──
  useEffect(() => {
    if (!activeConv) return;
    const unsub = staffChatService.onTypingChange((state) => {
      if (state.conversationId !== activeConv.id || state.staffId === 'current-user') return;
      setTypingNames(prev =>
        state.isTyping
          ? prev.includes(state.staffName) ? prev : [...prev, state.staffName]
          : prev.filter(n => n !== state.staffName)
      );
    });
    return unsub;
  }, [activeConv]);

  // ── Scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingNames]);

  // ── Open conversation ──
  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    setMobileView('chat');
    setTypingNames([]);
    const msgs = await staffChatService.getMessages(conv.id);
    setMessages(msgs);
    await staffChatService.markAsRead(conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    setTotalUnread(prev => Math.max(0, prev - conv.unreadCount));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Send message ──
  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const text = input.trim();
    setInput('');
    await staffChatService.stopTyping(activeConv.id);
    const msg = await staffChatService.sendMessage(activeConv.id, text);
    setMessages(prev => [...prev, msg]);
    inputRef.current?.focus();
  };

  // ── Typing indicator ──
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!activeConv) return;
    staffChatService.startTyping(activeConv.id);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      staffChatService.stopTyping(activeConv.id);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Layout ──
  const panelHeight = isExpanded ? 'h-[600px]' : 'h-[460px]';
  const panelWidth = isExpanded ? 'w-[700px]' : 'w-[480px]';

  const containerClass = mode === 'floating'
    ? `fixed bottom-4 right-4 z-50 rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${panelHeight} ${panelWidth} max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]`
    : 'flex flex-col h-full rounded-xl border overflow-hidden';

  return (
    <div
      className={containerClass}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {activeConv && mobileView === 'chat' && (
          <button
            className="md:hidden p-1 rounded hover:bg-white/5 shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setMobileView('list')}
          >
            <ArrowLeft size={14} />
          </button>
        )}
        <MessageSquare size={14} style={{ color: 'var(--primary)' }} className="shrink-0" />
        <span className="text-xs font-bold flex-1" style={{ color: 'var(--foreground)' }}>
          {activeConv && mobileView === 'chat' ? activeConv.name : 'Internal Chat'}
        </span>
        {totalUnread > 0 && mobileView === 'list' && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-bold"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}
          >
            {totalUnread}
          </span>
        )}
        {activeConv && mobileView === 'chat' && activeConv.presenceStatus && (
          <div className="flex items-center gap-1">
            <Circle size={7} fill={PRESENCE_COLORS[activeConv.presenceStatus]} style={{ color: PRESENCE_COLORS[activeConv.presenceStatus] }} />
            <span className="text-xs capitalize" style={{ color: PRESENCE_COLORS[activeConv.presenceStatus] }}>
              {activeConv.presenceStatus}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/staff/chat"
            className="p-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            title="Open full chat"
          >
            <Maximize2 size={12} />
          </Link>
          {mode === 'floating' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/5 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div
          className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} flex-col border-r shrink-0`}
          style={{ width: '160px', borderColor: 'var(--border)' }}
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-6 pr-2 py-1.5 rounded text-xs border focus:outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredConvs.map(conv => {
              const TypeIcon = CONV_TYPE_ICONS[conv.type] || User;
              const isActive = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="w-full flex items-center gap-2 px-2.5 py-2.5 text-left transition-colors hover:bg-white/5 border-b"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: isActive ? 'rgba(245,196,0,0.08)' : undefined,
                  }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isActive ? 'rgba(245,196,0,0.2)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <TypeIcon size={12} style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    </div>
                    {conv.presenceStatus && conv.type === 'direct' && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
                        style={{ backgroundColor: PRESENCE_COLORS[conv.presenceStatus], borderColor: 'var(--card)' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                        {conv.name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span
                          className="text-xs px-1 py-0.5 rounded-full font-bold shrink-0 ml-1"
                          style={{ backgroundColor: 'var(--primary)', color: '#000', fontSize: '9px' }}
                        >
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
          {activeConv ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                      No messages yet.<br />Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
                )}
                <TypingIndicator names={typingNames} />
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-2.5 shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    className="flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0"
                    style={{
                      backgroundColor: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      color: input.trim() ? '#000' : 'var(--muted-foreground)',
                    }}
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
              <MessageSquare size={28} style={{ color: 'var(--primary)', opacity: 0.4 }} />
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Select a conversation<br />to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
