'use client';
import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Plus, X, MessageSquare, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  agentName: string;
  agentInitial: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  away?: boolean;
  status: 'open' | 'waiting' | 'resolved';
}

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  time: string;
  read: boolean;
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: MessageSquare },
  waiting: { label: 'Waiting', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  resolved: { label: 'Resolved', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: CheckCircle2 },
};

const SUPPORT_CATEGORIES = [
  'Account & Verification',
  'Deposits & Withdrawals',
  'Trading & Orders',
  'Technical Issue',
  'Billing & Fees',
  'Other',
];

// Real conversations come from backend — empty until connected
const REAL_CONVERSATIONS: Conversation[] = [];

type ComposerStep = 'category' | 'message' | 'submitted';

export default function MessagesContent() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>(REAL_CONVERSATIONS);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState<ComposerStep>('category');
  const [newCategory, setNewCategory] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const conv = conversations.find(c => c.id === selectedConv);
  const currentMessages = selectedConv ? (messages[selectedConv] || []) : [];

  const handleSend = () => {
    if (!inputText.trim() || !selectedConv) return;
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStartConversation = () => {
    setComposerOpen(true);
    setComposerStep('category');
    setNewCategory('');
    setNewSubject('');
    setNewMessage('');
  };

  const handleSubmitConversation = () => {
    if (!newMessage.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setComposerStep('submitted');
    }, 800);
  };

  const handleCloseComposer = () => {
    setComposerOpen(false);
    setComposerStep('category');
  };

  const filteredConvs = conversations.filter(c =>
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
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Support</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Chat with your assigned support agent</p>
        </div>
        <button
          onClick={handleStartConversation}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'var(--primary)', color: '#000' }}
        >
          <Plus size={14} />
          Start Conversation
        </button>
      </div>

      {/* New Conversation Composer */}
      {composerOpen && (
        <div className="rounded-xl border mb-4 overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'rgba(212,168,0,0.3)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>New Conversation</p>
            </div>
            <button onClick={handleCloseComposer} className="p-1 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
              <X size={14} />
            </button>
          </div>

          {composerStep === 'submitted' ? (
            <div className="px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Conversation Started</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Your message has been submitted. A support agent will respond shortly.
              </p>
              <p className="text-xs px-3 py-2 rounded inline-block" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--muted-foreground)', border: '1px solid rgba(245,158,11,0.15)' }}>
                Backend persistence not yet connected — conversation will appear once support integration is complete.
              </p>
              <div className="mt-4">
                <button onClick={handleCloseComposer} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {(['category', 'message'] as ComposerStep[]).map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: composerStep === step || (step === 'category' && composerStep === 'message') ? 'var(--primary)' : 'var(--muted)',
                          color: composerStep === step || (step === 'category' && composerStep === 'message') ? '#000' : 'var(--muted-foreground)',
                        }}>
                        {step === 'category' && composerStep === 'message' ? '✓' : i + 1}
                      </div>
                      <span className="text-xs font-medium capitalize" style={{ color: composerStep === step ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {step === 'category' ? 'Category' : 'Message'}
                      </span>
                    </div>
                    {i < 1 && <div className="flex-1 h-px" style={{ backgroundColor: composerStep === 'message' ? 'var(--primary)' : 'var(--border)' }} />}
                  </React.Fragment>
                ))}
              </div>

              {composerStep === 'category' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SUPPORT_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNewCategory(cat)}
                          className="px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all"
                          style={{
                            borderColor: newCategory === cat ? 'var(--primary)' : 'var(--border)',
                            backgroundColor: newCategory === cat ? 'rgba(212,168,0,0.08)' : 'var(--muted)',
                            color: newCategory === cat ? 'var(--primary)' : 'var(--foreground)',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Subject (optional)</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Brief description of your issue…"
                      className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setComposerStep('message')}
                      disabled={!newCategory}
                      className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
                      style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {composerStep === 'message' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{newCategory}</span>
                    {newSubject && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {newSubject}</span>}
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Message</label>
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Describe your issue in detail…"
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setComposerStep('category')}
                      className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-muted"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitConversation}
                      disabled={!newMessage.trim() || submitting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
                      style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                    >
                      {submitting ? (
                        <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      {submitting ? 'Sending…' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border overflow-hidden flex" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', height: '560px' }}>
        {/* Conversation list */}
        <div className="w-72 shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--muted)' }}>
                  <MessageCircle size={18} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No conversations yet</p>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Start a conversation to get help from our support team.</p>
                <button
                  onClick={handleStartConversation}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                >
                  <Plus size={12} />
                  Start Conversation
                </button>
              </div>
            ) : (
              filteredConvs.map(c => {
                const statusCfg = STATUS_CONFIG[c.status];
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConv(c.id)}
                    className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 border-b ${selectedConv === c.id ? 'bg-primary-subtle' : ''}`}
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                        {c.agentInitial}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: getStatusColor(c), borderColor: 'var(--card)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate" style={{ color: selectedConv === c.id ? 'var(--primary)' : 'var(--foreground)' }}>{c.agentName}</span>
                        <span className="text-xs shrink-0 ml-1" style={{ color: 'var(--muted-foreground)' }}>{c.time}</span>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastMessage}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                        {c.status}
                      </span>
                    </div>
                    {c.unread > 0 && (
                      <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                        {c.unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        {conv ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {conv.agentInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border" style={{ backgroundColor: getStatusColor(conv), borderColor: 'var(--card)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{conv.agentName}</p>
                <p className="text-xs" style={{ color: conv.online ? 'var(--positive)' : 'var(--muted-foreground)' }}>
                  {conv.online ? 'Online' : conv.away ? 'Away' : 'Offline'}
                </p>
              </div>
              <div className="flex-1" />
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: STATUS_CONFIG[conv.status].bg, color: STATUS_CONFIG[conv.status].color }}>
                {STATUS_CONFIG[conv.status].label}
              </span>
              <button className="p-2 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <Phone size={15} />
              </button>
              <button className="p-2 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <MoreVertical size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'agent' && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                      {conv.agentInitial.slice(0, 1)}
                    </div>
                  )}
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className="px-3 py-2 text-xs leading-relaxed"
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
                      {msg.sender === 'customer' && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <MessageCircle size={28} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div>
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No conversation selected</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {conversations.length === 0
                  ? 'Click "Start Conversation" to get help from our support team.' :'Select a conversation from the list to view messages.'}
              </p>
            </div>
            {conversations.length === 0 && (
              <button
                onClick={handleStartConversation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                <Plus size={14} />
                Start Conversation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
