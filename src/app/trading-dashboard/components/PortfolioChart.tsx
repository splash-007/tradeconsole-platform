'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Props {
  history: { date: string; value: number }[];
}

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

export default function PortfolioChart({ history }: Props) {
  const formatted = history.map(h => ({
    date: h.date.replace('2026-', '').replace('-', '/'),
    value: h.value,
  }));

  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Portfolio Performance</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Aug 2026 · All time +20.6%</p>
        </div>
        <div className="flex gap-1">
          {['1W', '1M', '3M', 'ALL'].map(tf => (
            <button key={`ptf-${tf}`} className={`px-2 py-1 text-xs rounded transition-all ${tf === '1M' ? 'bg-primary-subtle text-gold font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
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
    </div>
  );
}