'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, KpiCard } from '@/components/admin/AdminUI';

const POSITIONS = [
  { id: 'pos-001', customerName: 'Alex Morgan', symbol: 'BTC/USDC', side: 'long', entryPrice: 67500, currentPrice: 67842, size: 0.1, pnl: 34.20, pnlPct: 0.51 },
  { id: 'pos-002', customerName: 'Priya Sharma', symbol: 'ETH/USDC', side: 'long', entryPrice: 3800, currentPrice: 3842, size: 2.0, pnl: 84.00, pnlPct: 1.11 },
  { id: 'pos-003', customerName: 'Aisha Al-Rashidi', symbol: 'SOL/USDC', side: 'long', entryPrice: 190, currentPrice: 182, size: 50, pnl: -400, pnlPct: -4.21 },
  { id: 'pos-004', customerName: 'Alex Morgan', symbol: 'SOL/USDC', side: 'long', entryPrice: 175, currentPrice: 182, size: 10, pnl: 70, pnlPct: 4.00 },
];

export default function AdminTradingPositionsContent() {
  const totalPnl = POSITIONS.reduce((s, p) => s + p.pnl, 0);
  return (
    <div className="space-y-4">
      <PageHeader title="Positions" subtitle="All open customer positions" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Positions" value={POSITIONS.length} />
        <KpiCard label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`} trend={totalPnl >= 0 ? 1.2 : -1.2} />
        <KpiCard label="Profitable" value={POSITIONS.filter(p => p.pnl > 0).length} />
        <KpiCard label="In Loss" value={POSITIONS.filter(p => p.pnl < 0).length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'symbol', label: 'Symbol', render: (p: any) => <span className="font-mono">{p.symbol}</span> },
            { key: 'side', label: 'Side', render: (p: any) => <span style={{ color: p.side === 'long' ? 'var(--positive)' : 'var(--negative)', textTransform: 'uppercase', fontWeight: 600 }}>{p.side}</span> },
            { key: 'entryPrice', label: 'Entry', render: (p: any) => `$${p.entryPrice.toLocaleString()}` },
            { key: 'currentPrice', label: 'Current', render: (p: any) => `$${p.currentPrice.toLocaleString()}` },
            { key: 'size', label: 'Size' },
            { key: 'pnl', label: 'P&L', render: (p: any) => (
              <span style={{ color: p.pnl >= 0 ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>
                {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
              </span>
            )},
            { key: 'pnlPct', label: 'P&L %', render: (p: any) => (
              <span style={{ color: p.pnlPct >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%
              </span>
            )},
          ]}
          data={POSITIONS}
        />
      </Card>
    </div>
  );
}
