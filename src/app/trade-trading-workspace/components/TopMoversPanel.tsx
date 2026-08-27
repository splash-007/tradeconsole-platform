'use client';
import React from 'react';
import { MarketInstrument } from '@/services/markets.service';

interface Props {
  instruments: MarketInstrument[];
  onSelectSymbol: (s: string) => void;
}

const COIN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  XAU: '⬡',
};

const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  XAU: '#FFD700',
};

export default function TopMoversPanel({ instruments, onSelectSymbol }: Props) {
  const topMovers = instruments
    .filter(i => i.category === 'crypto' || i.category === 'commodities')
    .slice(0, 4);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      <div className="px-3 py-1.5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Top Movers</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {topMovers.map((inst, idx) => {
          const baseSymbol = inst.symbol.split('/')[0];
          const isPos = inst.changePct24h >= 0;
          const color = COIN_COLORS[baseSymbol] || 'var(--primary)';
          const icon = COIN_ICONS[baseSymbol] || baseSymbol.slice(0, 1);

          return (
            <div
              key={`tm-${inst.id}`}
              onClick={() => onSelectSymbol(inst.symbol)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors cursor-pointer border-b last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              {/* Icon */}
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `${color}22`, color }}>
                {icon}
              </div>
              {/* Symbol */}
              <span className="text-xs font-semibold flex-1" style={{ color: 'var(--foreground)' }}>{baseSymbol}</span>
              {/* Change */}
              <span className={`text-xs font-semibold tabular-nums font-mono ${isPos ? 'text-positive' : 'text-negative'}`}>
                {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
              </span>
              {/* Mini sparkline (decorative) */}
              <svg width="40" height="20" viewBox="0 0 40 20" className="shrink-0">
                <polyline
                  points={isPos
                    ? "0,16 8,14 16,10 24,8 32,6 40,4" :"0,4 8,6 16,8 24,10 32,14 40,16"}
                  fill="none"
                  stroke={isPos ? 'var(--positive)' : 'var(--negative)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
