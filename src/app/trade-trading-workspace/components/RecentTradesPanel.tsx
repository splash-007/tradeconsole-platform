'use client';
import React from 'react';
import type { NormalizedTrade } from '@/services/market-data.service';

// Re-export for convenience
export type { NormalizedTrade } from '@/services/market-data.service';

interface Props {
  trades: NormalizedTrade[];
}

function formatTime(ms: number) {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export default function RecentTradesPanel({ trades }: Props) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      <div className="px-3 py-1.5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Recent Trades</span>
      </div>
      <div className="grid px-3 py-1 shrink-0" style={{ gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
        {['Price', 'Size', 'Time'].map(h => (
          <span key={`rt-hdr-${h}`} className="text-xs text-right first:text-left" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {trades.map(trade => (
          <div
            key={`rt-${trade.id}`}
            className="grid px-3 py-1 hover:bg-muted transition-colors"
            style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
          >
            <span className={`text-xs tabular-nums font-mono ${trade.side === 'buy' ? 'text-positive' : 'text-negative'}`}>
              {trade.price >= 1 ? trade.price.toFixed(2) : trade.price.toFixed(6)}
            </span>
            <span className="text-xs tabular-nums font-mono text-right" style={{ color: 'var(--foreground)' }}>
              {trade.size.toFixed(4)}
            </span>
            <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>
              {formatTime(trade.timestamp)}
            </span>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="flex items-center justify-center h-16">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Waiting for trades…</span>
          </div>
        )}
      </div>
    </div>
  );
}