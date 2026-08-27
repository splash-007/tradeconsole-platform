'use client';
import React from 'react';
import Link from 'next/link';
import { MarketInstrument } from '@/services/markets.service';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props { instruments: MarketInstrument[]; }

export default function TopMovers({ instruments }: Props) {
  return (
    <div className="rounded-lg border h-full p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Top Movers</h3>
        <Link href="/markets" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
      </div>
      <div className="space-y-1">
        {instruments.map(inst => {
          const isPos = inst.changePct24h >= 0;
          const sparkData = inst.sparkline.map((v, i) => ({ i, v }));
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
                  ${inst.lastPrice < 10 ? inst.lastPrice.toFixed(4) : inst.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-14 h-8 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke={isPos ? 'var(--positive)' : 'var(--negative)'} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`text-xs font-semibold tabular-nums w-14 text-right shrink-0 ${isPos ? 'text-positive' : 'text-negative'}`}>
                {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}