'use client';
import React, { useMemo } from 'react';
import { MarketInstrument } from '@/services/markets.service';
import AssetIcon from '@/components/ui/AssetIcon';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  instruments: MarketInstrument[];
  onSelectSymbol: (s: string) => void;
}

interface FallbackMover {
  symbol: string;
  name: string;
  changePct: number;
  basePrice: number;
}

const CRYPTO_FALLBACK_MOVERS: FallbackMover[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', changePct: 1.86, basePrice: 67842 },
  { symbol: 'ETH/USDT', name: 'Ethereum', changePct: -2.40, basePrice: 3542 },
  { symbol: 'SOL/USDT', name: 'Solana', changePct: 4.77, basePrice: 182 },
  { symbol: 'BNB/USDT', name: 'BNB', changePct: 1.43, basePrice: 612 },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', changePct: 4.32, basePrice: 0.162 },
  { symbol: 'ADA/USDT', name: 'Cardano', changePct: 1.05, basePrice: 0.48 },
  { symbol: 'AVAX/USDT', name: 'Avalanche', changePct: -0.78, basePrice: 38.4 },
  { symbol: 'DOT/USDT', name: 'Polkadot', changePct: 0.34, basePrice: 7.82 },
];

interface MoverItem {
  symbol: string;
  name: string;
  changePct24h: number;
  lastPrice: number;
  id: string;
}

function generateSparkline(changePct: number, basePrice: number): { v: number }[] {
  const points = 12;
  const data: { v: number }[] = [];
  let price = basePrice;
  const trend = changePct / 100;
  for (let i = 0; i < points; i++) {
    const noise = (Math.sin(i * 2.3 + changePct) * 0.008 + Math.cos(i * 1.7) * 0.005);
    price = price * (1 + noise + trend / points);
    data.push({ v: price });
  }
  return data;
}

export default function TopMoversPanel({ instruments, onSelectSymbol }: Props) {
  const cryptoInstruments = instruments.filter(i => i.category === 'crypto');

  const topMovers: MoverItem[] = cryptoInstruments.length > 0
    ? [...cryptoInstruments]
        .sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h))
        .slice(0, 8)
        .map(i => ({ symbol: i.symbol, name: i.name, changePct24h: i.changePct24h, lastPrice: i.lastPrice, id: i.id }))
    : CRYPTO_FALLBACK_MOVERS.map((m, i) => ({
        id: `fallback-${i}`,
        symbol: m.symbol,
        name: m.name,
        changePct24h: m.changePct,
        lastPrice: m.basePrice,
      }));

  const basePrices: number[] = cryptoInstruments.length > 0
    ? topMovers.map(m => m.lastPrice || 100)
    : CRYPTO_FALLBACK_MOVERS.slice(0, topMovers.length).map(m => m.basePrice);

  const sparklines = useMemo(() => {
    return topMovers.map((inst, idx) => {
      const base = basePrices[idx] || inst.lastPrice || 100;
      return generateSparkline(inst.changePct24h, base);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topMovers.map(i => i.symbol).join(',')]);

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--tc-bg)', border: '1px solid var(--tc-border)' }}
    >
      <div
        className="px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--tc-border)', backgroundColor: 'var(--tc-surface)' }}
      >
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--tc-text-primary)' }}>Top Movers</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {topMovers.map((inst, idx) => {
          const isPos = inst.changePct24h >= 0;
          const sparkData = sparklines[idx] || [];
          const strokeColor = isPos ? '#16a34a' : '#dc2626';

          return (
            <div
              key={`tm-${inst.id}-${idx}`}
              onClick={() => onSelectSymbol(inst.symbol)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors"
              style={{ borderColor: 'var(--tc-border)' }}
            >
              <span className="text-xs font-mono w-4 shrink-0" style={{ color: 'var(--tc-text-muted)' }}>{idx + 1}</span>
              <AssetIcon symbol={inst.symbol} assetType="crypto" size={22} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block truncate" style={{ color: 'var(--tc-text-primary)' }}>{inst.symbol.split('/')[0]}</span>
                {inst.lastPrice > 0 && (
                  <span className="text-xs font-mono" style={{ color: 'var(--tc-text-muted)' }}>
                    ${inst.lastPrice >= 1 ? inst.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : inst.lastPrice.toFixed(6)}
                  </span>
                )}
              </div>
              {/* Recharts sparkline */}
              <div style={{ width: 48, height: 28 }} className="shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={strokeColor}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <span className={`text-sm font-bold tabular-nums font-mono w-14 text-right shrink-0 ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
