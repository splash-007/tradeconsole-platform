'use client';
import React from 'react';
import { MarketInstrument } from '@/services/markets.service';
import { TrendingUp } from 'lucide-react';

interface Props {
  symbol: string;
  instrument?: MarketInstrument;
}

export default function MarketOverviewPanel({ symbol, instrument }: Props) {
  const baseSymbol = symbol.split('/')[0];

  const stats = [
    { label: 'Market Cap', value: '1.34T', change: '+1.85%', positive: true },
    { label: '24h Volume', value: '845.67M', change: '+12.4%', positive: true },
    { label: 'Circulating Supply', value: `19.6M ${baseSymbol}`, change: null, positive: null },
    { label: 'Dominance', value: '52.3%', change: '+0.4%', positive: true },
  ];

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--tc-bg)', border: '1px solid var(--tc-border)' }}
    >
      <div
        className="px-3 py-2 border-b shrink-0 flex items-center gap-2"
        style={{ borderColor: 'var(--tc-border)', backgroundColor: 'var(--tc-surface)' }}
      >
        <TrendingUp size={12} style={{ color: 'var(--primary)' }} />
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--tc-text-primary)' }}>Market Overview</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1">
        {stats.map((stat, idx) => (
          <div
            key={`mo-${idx}`}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
            style={{ borderColor: 'var(--tc-border)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--tc-text-secondary)' }}>{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--tc-text-primary)' }}>{stat.value}</span>
              {stat.change && (
                <span className={`text-xs font-semibold tabular-nums ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
