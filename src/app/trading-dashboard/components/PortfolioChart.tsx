'use client';
import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Position } from '@/services/portfolio.service';

interface Props {
  history: { date: string; value: number }[];
  positions?: Position[];
}

const TIMEFRAMES = ['1W', '1M', '3M', 'ALL'] as const;
type TF = typeof TIMEFRAMES[number];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md border shadow-lg" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--primary)' }}>
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
      </p>
    </div>
  );
};

export default function PortfolioChart({ history, positions = [] }: Props) {
  const [timeframe, setTimeframe] = useState<TF>('1M');

  const totalValue = positions.length > 0
    ? positions.reduce((sum, p) => sum + p.value, 0) + 12480
    : history.length > 0 ? history[history.length - 1]?.value ?? 0 : 0;

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const pnlPct = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  const filtered = useMemo(() => {
    const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : history.length;
    return history.slice(-days);
  }, [history, timeframe]);

  const formatted = filtered.map(h => ({
    date: h.date.replace('2026-', '').replace('-', '/'),
    value: h.value,
  }));

  const firstVal = formatted[0]?.value ?? 0;
  const lastVal = formatted[formatted.length - 1]?.value ?? 0;
  const periodChange = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;
  const isPositive = periodChange >= 0;

  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Portfolio Performance</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
              {isPositive ? '+' : ''}{periodChange.toFixed(2)}%
            </span>
          </div>
          {positions.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: totalPnl >= 0 ? '#22c55e' : '#ef4444' }}>
              Unrealized P&L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={`ptf-${tf}`}
              onClick={() => setTimeframe(tf)}
              className="px-2 py-1 text-xs rounded transition-all"
              style={{
                backgroundColor: tf === timeframe ? 'rgba(245,196,0,0.15)' : 'transparent',
                color: tf === timeframe ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: tf === timeframe ? 600 : 400,
              }}>
              {tf}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#portfolioGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      {positions.length > 0 && (
        <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderColor: 'var(--border)' }}>
          {positions.map(p => (
            <div key={p.id} className="text-xs">
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>{p.symbol}</p>
              <p style={{ color: p.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)} ({p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}