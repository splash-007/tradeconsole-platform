'use client';
import React from 'react';
import { MarketInstrument } from '@/services/markets.service';
import { TrendingUp } from 'lucide-react';

interface Props {
  symbol: string;
  instrument?: MarketInstrument;
}

const MARKET_STATS = [
  { label: 'Market Cap', key: 'marketCap', suffix: '' },
  { label: '24h Volume', key: 'volume', suffix: '' },
  { label: 'Circulating Supply', key: 'supply', suffix: '' },
  { label: 'Dominance', key: 'dominance', suffix: '' },
];

export default function MarketOverviewPanel({ symbol, instrument }: Props) {
  const baseSymbol = symbol.split('/')[0];

  const stats = [
    { label: 'Market Cap', value: '1.34T', change: '+1.85%', positive: true },
    { label: '24h Volume', value: '845.67M', change: '+12.4%', positive: true },
    { label: 'Circulating Supply', value: `19.6M ${baseSymbol}`, change: null, positive: null },
    { label: 'Dominance', value: '52.3%', change: '+0.4%', positive: true },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      <div className="px-3 py-1.5 border-b shrink-0 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <TrendingUp size={12} style={{ color: 'var(--primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Market Overview</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-2">
        {stats.map((stat, idx) => (
          <div key={`mo-${idx}`} className="flex items-center justify-between py-1 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{stat.value}</span>
              {stat.change && (
                <span className={`text-xs font-semibold tabular-nums ${stat.positive ? 'text-positive' : 'text-negative'}`}>
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
