'use client';
import React from 'react';
import type { NormalizedTrade } from '@/services/market-data.service';

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
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--tc-bg)', border: '1px solid var(--tc-border)' }}
    >
      <div
        className="px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--tc-border)', backgroundColor: 'var(--tc-surface)' }}
      >
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--tc-text-primary)' }}>Recent Trades</span>
      </div>
      <div
        className="grid px-3 py-1.5 shrink-0"
        style={{ gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--tc-border)', backgroundColor: 'var(--tc-surface)' }}
      >
        {['Price', 'Amount (BTC)', 'Time'].map(h => (
          <span key={`rt-hdr-${h}`} className="text-xs font-semibold uppercase tracking-wide text-right first:text-left" style={{ color: 'var(--tc-text-muted)' }}>{h}</span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {trades.map(trade => (
          <div
            key={`rt-${trade.id}`}
            className="grid px-3 py-1 transition-colors"
            style={{ gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--tc-border)' }}
          >
            <span className={`text-sm tabular-nums font-mono font-semibold ${trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
              {trade.price >= 1 ? trade.price.toFixed(2) : trade.price.toFixed(6)}
            </span>
            <span className="text-sm tabular-nums font-mono text-right font-medium" style={{ color: 'var(--tc-text-primary)' }}>
              {trade.size.toFixed(4)}
            </span>
            <span className="text-xs text-right" style={{ color: 'var(--tc-text-muted)' }}>
              {formatTime(trade.timestamp)}
            </span>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="flex items-center justify-center h-16">
            <span className="text-sm" style={{ color: 'var(--tc-text-muted)' }}>Waiting for trades…</span>
          </div>
        )}
      </div>
    </div>
  );
}