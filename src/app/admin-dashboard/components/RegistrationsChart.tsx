'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props { data: { date: string; count: number }[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md border shadow-lg text-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--primary)' }}>{payload[0].value} registrations</p>
    </div>
  );
};

export default function RegistrationsChart({ data }: Props) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Registrations Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#regGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}