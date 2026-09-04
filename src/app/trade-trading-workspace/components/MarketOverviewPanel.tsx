'use client';
import React from 'react';
import { MarketInstrument } from '@/services/markets.service';
import { TrendingUp } from 'lucide-react';

interface Props {
  symbol: string;
  instrument?: MarketInstrument;
}

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';

export default function MarketOverviewPanel({ symbol, instrument }: Props) {
  const baseSymbol = symbol.split('/')[0];

  const stats = [
    { label: 'Market Cap', value: '1.34T', change: '+1.85%', positive: true },
    { label: '24h Volume', value: '845.67M', change: '+12.4%', positive: true },
    { label: 'Circulating Supply', value: `19.6M ${baseSymbol}`, change: null, positive: null },
    { label: 'Dominance', value: '52.3%', change: '+0.4%', positive: true },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: termBg }}>
      <div
        className="px-3 py-1.5 border-b shrink-0 flex items-center gap-2"
        style={{ borderColor: termBorder, backgroundColor: termSurface }}
      >
        <TrendingUp size={11} style={{ color: 'var(--primary)' }} />
        <span className="text-xs font-semibold text-white">Market Overview</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
        {stats.map((stat, idx) => (
          <div
            key={`mo-${idx}`}
            className="flex items-center justify-between py-1 border-b last:border-b-0"
            style={{ borderColor: termBorder }}
          >
            <span className="text-xs text-gray-500">{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tabular-nums font-mono text-white">{stat.value}</span>
              {stat.change && (
                <span className={`text-xs font-semibold tabular-nums ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
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
