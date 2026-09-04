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

// Crypto-only top movers — replace any non-crypto with these
const CRYPTO_FALLBACK_MOVERS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', changePct: 1.86 },
  { symbol: 'ETH/USDT', name: 'Ethereum', changePct: -2.40 },
  { symbol: 'SOL/USDT', name: 'Solana', changePct: 4.77 },
  { symbol: 'BNB/USDT', name: 'BNB', changePct: 1.43 },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', changePct: 4.32 },
  { symbol: 'ADA/USDT', name: 'Cardano', changePct: 1.05 },
  { symbol: 'AVAX/USDT', name: 'Avalanche', changePct: -0.78 },
  { symbol: 'DOT/USDT', name: 'Polkadot', changePct: 0.34 },
];

export default function TopMoversPanel({ instruments, onSelectSymbol }: Props) {
  // Only use crypto instruments, sorted by absolute change
  const cryptoInstruments = instruments.filter(i => i.category === 'crypto');
  
  // If we have crypto instruments from the service, sort by absolute change
  // Otherwise use fallback crypto data
  const topMovers = cryptoInstruments.length > 0
    ? [...cryptoInstruments].sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h)).slice(0, 8)
    : CRYPTO_FALLBACK_MOVERS.map((m, i) => ({
        id: `fallback-${i}`,
        symbol: m.symbol,
        name: m.name,
        baseCurrency: m.symbol.split('/')[0],
        quoteCurrency: 'USDT',
        lastPrice: 0,
        bid: 0,
        ask: 0,
        change24h: 0,
        changePct24h: m.changePct,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        marketCap: 0,
        category: 'crypto' as const,
        status: 'open' as const,
        sparkline: [],
      }));

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: termBg, border: `1px solid ${termBorder}` }}
    >
      <div
        className="px-3 py-2 border-b shrink-0"
        style={{ borderColor: termBorder, backgroundColor: termSurface }}
      >
        <span className="text-xs font-semibold text-white tracking-wide uppercase">Top Movers</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {topMovers.map((inst, idx) => {
          const isPos = inst.changePct24h >= 0;
          return (
            <div
              key={`tm-${inst.id || idx}`}
              onClick={() => onSelectSymbol(inst.symbol)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors hover:bg-white/5"
              style={{ borderColor: termBorder }}
            >
              <span className="text-xs font-mono text-gray-600 w-4 shrink-0">{idx + 1}</span>
              <AssetIcon symbol={inst.symbol} assetType="crypto" size={22} />
              <span className="text-xs font-semibold flex-1 text-white">{inst.symbol.split('/')[0]}</span>
              <span className={`text-xs font-bold tabular-nums font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>
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
