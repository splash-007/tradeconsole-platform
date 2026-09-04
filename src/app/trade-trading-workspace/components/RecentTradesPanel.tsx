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

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';

export default function RecentTradesPanel({ trades }: Props) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: termBg }}>
      <div
        className="px-3 py-1.5 border-b shrink-0"
        style={{ borderColor: termBorder, backgroundColor: termSurface }}
      >
        <span className="text-xs font-semibold text-white">Recent Trades</span>
      </div>
      <div
        className="grid px-3 py-1 shrink-0"
        style={{ gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${termBorder}` }}
      >
        {['Price', 'Amount (BTC)', 'Time'].map(h => (
          <span key={`rt-hdr-${h}`} className="text-xs text-right first:text-left text-gray-600">{h}</span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {trades.map(trade => (
          <div
            key={`rt-${trade.id}`}
            className="grid px-3 py-0.5 transition-colors"
            style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
          >
            <span className={`text-xs tabular-nums font-mono ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
              {trade.price >= 1 ? trade.price.toFixed(2) : trade.price.toFixed(6)}
            </span>
            <span className="text-xs tabular-nums font-mono text-right text-white">
              {trade.size.toFixed(4)}
            </span>
            <span className="text-xs text-right text-gray-500">
              {formatTime(trade.timestamp)}
            </span>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="flex items-center justify-center h-16">
            <span className="text-xs text-gray-600">Waiting for trades…</span>
          </div>
        )}
      </div>
    </div>
  );
}