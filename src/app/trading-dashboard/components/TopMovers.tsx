'use client';
import React from 'react';
import Link from 'next/link';
import { MarketInstrument } from '@/services/markets.service';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import MiniCandleChart from '@/components/trading/MiniCandleChart';

interface Props { instruments: MarketInstrument[]; }

const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

export default function TopMovers({ instruments }: Props) {
  const { quotes, candles } = useRealTimeMarket(LIVE_SYMBOLS);

  return (
    <div className="rounded-lg border h-full p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Top Movers</h3>
        <div className="flex items-center gap-2">
          {Object.keys(quotes).length > 0 && (
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
          const live = quotes[inst.symbol];
          const price = live?.price ?? inst.lastPrice;
          const changePct = live?.changePct24h ?? inst.changePct24h;
          const isPos = changePct >= 0;
          const liveCandles = candles[inst.symbol];
          const hasCandles = liveCandles && liveCandles.length >= 2;

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
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.symbol}</p>
                <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
                  ${price < 10 ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              {/* Mini candlestick chart */}
              <div className="w-16 h-8 shrink-0">
                {hasCandles ? (
                  <MiniCandleChart candles={liveCandles} width={64} height={32} />
                ) : (
                  // Animated loading skeleton
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
                {isPos ? '+' : ''}{changePct.toFixed(2)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}