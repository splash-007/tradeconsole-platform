'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PortfolioAllocation } from '@/services/portfolio.service';

interface Props {
  allocation: PortfolioAllocation[];
  totalValue: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-md border shadow-lg text-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{d.symbol}</p>
      <p style={{ color: 'var(--muted-foreground)' }}>${d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      <p style={{ color: 'var(--primary)' }}>{d.pct.toFixed(1)}%</p>
    </div>
  );
};

export default function AllocationChart({ allocation, totalValue }: Props) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Allocation</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {allocation.map((entry, idx) => (
                <Cell key={`alloc-cell-${idx}`} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total</p>
          <p className="text-base font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
            ${(totalValue / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {allocation.map(item => (
          <div key={`alloc-leg-${item.symbol}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{item.symbol}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>${item.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
              <span className="text-xs font-semibold tabular-nums w-10 text-right" style={{ color: 'var(--foreground)' }}>{item.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}