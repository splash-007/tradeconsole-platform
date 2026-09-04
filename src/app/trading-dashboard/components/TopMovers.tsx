'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { MarketInstrument } from '@/services/markets.service';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import AssetIcon from '@/components/ui/AssetIcon';
import MiniCandleChart from '@/components/trading/MiniCandleChart';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';

interface Props { instruments: MarketInstrument[]; }

const REAL_SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'BNB/USD', 'ADA/USD', 'AVAX/USD', 'DOT/USD'];
const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

const REAL_MAP: Record<string, string> = {
  'BTC/USDT': 'BTC/USD', 'ETH/USDT': 'ETH/USD',
  'SOL/USDT': 'SOL/USD', 'XRP/USDT': 'XRP/USD',
  'BNB/USDT': 'BNB/USD', 'ADA/USDT': 'ADA/USD',
  'AVAX/USDT': 'AVAX/USD', 'DOT/USDT': 'DOT/USD',
};

const BINANCE_MAP: Record<string, string> = {
  'BTC/USDT': 'BTC/USDC', 'ETH/USDT': 'ETH/USDC',
  'SOL/USDT': 'SOL/USDC', 'BNB/USDT': 'BNB/USDC',
  'XRP/USDT': 'XRP/USDC', 'ADA/USDT': 'ADA/USDC',
  'AVAX/USDT': 'AVAX/USDC', 'DOT/USDT': 'DOT/USDC',
};

export default function TopMovers({ instruments }: Props) {
  const { quotes: realQuotes } = useMarketQuotes(REAL_SYMBOLS);
  const { quotes: wsQuotes, candles } = useRealTimeMarket(LIVE_SYMBOLS);

  const hasAnyLive = Object.values(realQuotes).some(q => q.available) || Object.keys(wsQuotes).length > 0;

  // Build enriched instrument list with live data, then sort by |changePercent| descending
  const rankedMovers = useMemo(() => {
    const enriched = instruments.map(inst => {
      const realSym = REAL_MAP[inst.symbol];
      const wsSym = BINANCE_MAP[inst.symbol];
      const realState = realSym ? realQuotes[realSym] : undefined;
      const wsQuote = wsSym ? wsQuotes[wsSym] : undefined;

      const price = (realState?.available && realState.quote?.price != null)
        ? realState.quote.price
        : (wsQuote?.price ?? inst.lastPrice);

      const changePercent = (realState?.available && realState.quote?.changePercent != null)
        ? realState.quote.changePercent
        : (wsQuote?.changePct24h ?? inst.changePct24h);

      const isRealData = (realState?.available && realState.quote?.price != null) || wsQuote?.price != null;
      const liveCandles = wsSym ? candles[wsSym] : undefined;

      return { ...inst, price, changePercent, isRealData, liveCandles };
    });

    // Sort by absolute change percent descending (biggest movers first)
    return enriched.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [instruments, realQuotes, wsQuotes, candles]);

  return (
    <div className="rounded-lg border h-full" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Top Movers</h3>
        <div className="flex items-center gap-3">
          {hasAnyLive && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live</span>
            </div>
          )}
          <Link href="/markets" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>All markets</Link>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {rankedMovers.slice(0, 6).map((inst, idx) => {
          const isPos = inst.changePercent >= 0;
          const hasCandles = inst.liveCandles && inst.liveCandles.length >= 2;

          return (
            <Link
              key={`mover-${inst.id}`}
              href="/trade-trading-workspace"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors cursor-pointer"
            >
              {/* Rank */}
              <span className="text-xs font-mono w-4 shrink-0 text-right" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                {idx + 1}
              </span>
              <AssetIcon symbol={inst.symbol} assetType="crypto" size={26} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.symbol.split('/')[0]}</p>
                  {inst.isRealData && (
                    <div className="w-1 h-1 rounded-full bg-green-500 shrink-0" title="Live" />
                  )}
                </div>
                <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
                  ${inst.price < 10 ? inst.price.toFixed(4) : inst.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-14 h-7 shrink-0">
                {hasCandles ? (
                  <MiniCandleChart candles={inst.liveCandles!} width={56} height={28} />
                ) : (
                  <div className="flex items-end gap-px w-full h-full">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={`sk-${inst.id}-${i}`}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${35 + Math.sin(i * 1.5 + inst.id.charCodeAt(0)) * 25}%`,
                          backgroundColor: isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-xs font-semibold tabular-nums w-14 text-right shrink-0 ${isPos ? 'text-positive' : 'text-negative'}`}>
                {isPos ? '+' : ''}{inst.changePercent.toFixed(2)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}