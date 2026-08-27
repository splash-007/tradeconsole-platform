'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props { data: { source: string; count: number; conversion: number }[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md border shadow-lg text-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      <p style={{ color: 'var(--primary)' }}>{payload[0]?.value?.toLocaleString()} registrations</p>
      {payload[1] && <p style={{ color: 'var(--positive)' }}>{payload[1].value}% conversion</p>}
    </div>
  );
};

const COLORS = ['var(--primary)', 'rgba(245,196,0,0.8)', 'rgba(245,196,0,0.6)', 'rgba(245,196,0,0.5)', 'rgba(245,196,0,0.4)', 'rgba(245,196,0,0.3)', 'rgba(245,196,0,0.2)'];

export default function SourcePerformanceChart({ data }: Props) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Source Performance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="source" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((_, idx) => (
              <Cell key={`src-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}