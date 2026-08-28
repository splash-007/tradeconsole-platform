'use client';
import React, { useState, useEffect, useRef } from 'react';
import { marketAIService, AIMessage } from '@/services/market-ai.service';
import { Bot, Send, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const QUICK_PROMPTS = [
  'BTC market trend',
  'ETH analysis',
  'Market overview',
  'Deposit patterns',
];

interface MarketAIChatProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function MarketAIChat({ collapsed = false, onToggle }: MarketAIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your market analysis assistant. Ask me about crypto trends, technical analysis, or client portfolio insights.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await marketAIService.sendMessage(messages, content);
      setMessages(prev => [...prev, response]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer select-none"
        style={{ borderColor: 'var(--border)' }}
        onClick={onToggle}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
          <Bot size={12} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Market AI Assistant</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI-powered market analysis assistant</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Active</span>
          {onToggle && (collapsed ? <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronUp size={12} style={{ color: 'var(--muted-foreground)' }} />)}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Quick prompts */}
          <div className="flex gap-1.5 px-3 py-2 border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border)' }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors hover:border-yellow-400/50 disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'transparent' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: '200px', maxHeight: '280px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
                    <TrendingUp size={10} style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{
                    backgroundColor: msg.role === 'user' ? 'rgba(245,196,0,0.12)' : 'var(--background)',
                    color: 'var(--foreground)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(245,196,0,0.2)' : 'var(--border)'}`,
                  }}>
                  {msg.content}
                  <div className="mt-1 text-xs opacity-50">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
                  <RefreshCw size={10} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  Analyzing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about market trends..."
              disabled={loading}
              className="flex-1 text-xs px-3 py-2 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}
            >
              <Send size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
