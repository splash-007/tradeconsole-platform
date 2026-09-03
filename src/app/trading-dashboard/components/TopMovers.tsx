'use client';
import React from 'react';
import Link from 'next/link';
import { MarketInstrument } from '@/services/markets.service';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import MiniCandleChart from '@/components/trading/MiniCandleChart';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';

interface Props { instruments: MarketInstrument[]; }

// Symbols that have real data from Twelve Data / Tiingo
const REAL_SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD'];
const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

// Map instrument symbol to real data symbol
const REAL_MAP: Record<string, string> = {
  'BTC/USDT': 'BTC/USD',
  'ETH/USDT': 'ETH/USD',
  'SOL/USDT': 'SOL/USD',
  'XRP/USDT': 'XRP/USD',
};

// Map instrument symbol to Binance WS symbol
const BINANCE_MAP: Record<string, string> = {
  'BTC/USDT': 'BTC/USDC',
  'ETH/USDT': 'ETH/USDC',
  'SOL/USDT': 'SOL/USDC',
  'BNB/USDT': 'BNB/USDC',
  'XRP/USDT': 'XRP/USDC',
  'ADA/USDT': 'ADA/USDC',
};

export default function TopMovers({ instruments }: Props) {
  const { quotes: realQuotes } = useMarketQuotes(REAL_SYMBOLS);
  const { quotes: wsQuotes, candles } = useRealTimeMarket(LIVE_SYMBOLS);

  const hasAnyLive = Object.values(realQuotes).some(q => q.available) || Object.keys(wsQuotes).length > 0;

  return (
    <div className="rounded-lg border h-full p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Top Movers</h3>
        <div className="flex items-center gap-2">
          {hasAnyLive && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live</span>
            </div>
          )}
          <Link href="/markets" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
        </div>
      </div>
      <div className="space-y-1">
        {instruments.map(inst => {
          const realSym = REAL_MAP[inst.symbol];
          const wsSym = BINANCE_MAP[inst.symbol];
          const realState = realSym ? realQuotes[realSym] : undefined;
          const wsQuote = wsSym ? wsQuotes[wsSym] : undefined;

          // Prefer real data, fall back to WS, then mock
          const price = (realState?.available && realState.quote?.price != null)
            ? realState.quote.price
            : (wsQuote?.price ?? inst.lastPrice);

          const changePercent = (realState?.available && realState.quote?.changePercent != null)
            ? realState.quote.changePercent
            : (wsQuote?.changePct24h ?? inst.changePct24h);

          const isPos = changePercent >= 0;
          const liveCandles = wsSym ? candles[wsSym] : undefined;
          const hasCandles = liveCandles && liveCandles.length >= 2;
          const isRealData = realState?.available && realState.quote?.price != null;

          return (
            <Link
              key={`mover-${inst.id}`}
              href="/trade-trading-workspace"
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                {inst.baseCurrency.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.symbol}</p>
                  {isRealData && (
                    <div className="w-1 h-1 rounded-full bg-green-500 shrink-0" title="Live data" />
                  )}
                </div>
                <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
                  ${price < 10 ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-16 h-8 shrink-0">
                {hasCandles ? (
                  <MiniCandleChart candles={liveCandles} width={64} height={32} />
                ) : (
                  <div className="flex items-end gap-px w-full h-full">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div
                        key={`sk-${inst.id}-${i}`}
                        className="flex-1 rounded-sm animate-pulse"
                        style={{
                          height: `${35 + Math.sin(i * 1.5) * 25}%`,
                          backgroundColor: isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-xs font-semibold tabular-nums w-14 text-right shrink-0 ${isPos ? 'text-positive' : 'text-negative'}`}>
                {isPos ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}