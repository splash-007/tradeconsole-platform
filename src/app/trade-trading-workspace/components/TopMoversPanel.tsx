'use client';
import React from 'react';
import { MarketInstrument } from '@/services/markets.service';
import AssetIcon from '@/components/ui/AssetIcon';

interface Props {
  instruments: MarketInstrument[];
  onSelectSymbol: (s: string) => void;
}

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';

export default function TopMoversPanel({ instruments, onSelectSymbol }: Props) {
  const topMovers = instruments
    .filter(i => i.category === 'crypto' || i.category === 'commodities')
    .slice(0, 4);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: termBg }}>
      <div
        className="px-3 py-1.5 border-b shrink-0"
        style={{ borderColor: termBorder, backgroundColor: termSurface }}
      >
        <span className="text-xs font-semibold text-white">Top Movers</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {topMovers.map((inst) => {
          const isPos = inst.changePct24h >= 0;
          return (
            <div
              key={`tm-${inst.id}`}
              onClick={() => onSelectSymbol(inst.symbol)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors hover:bg-white/5"
              style={{ borderColor: termBorder }}
            >
              <AssetIcon symbol={inst.symbol} assetType="crypto" size={22} />
              <span className="text-xs font-semibold flex-1 text-white">{inst.symbol.split('/')[0]}</span>
              <span className={`text-xs font-semibold tabular-nums font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
              </span>
              {/* Mini sparkline */}
              <svg width="40" height="18" viewBox="0 0 40 18" className="shrink-0">
                <polyline
                  points={isPos
                    ? "0,14 8,12 16,9 24,7 32,5 40,3" :"0,3 8,5 16,7 24,9 32,12 40,14"}
                  fill="none"
                  stroke={isPos ? '#22c55e' : '#ef4444'}
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
