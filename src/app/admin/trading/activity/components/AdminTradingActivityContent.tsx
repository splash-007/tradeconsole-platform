'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, KpiCard } from '@/components/admin/AdminUI';

const ACTIVITY = [
  { id: 'act-001', customerName: 'Alex Morgan', action: 'Order Placed', symbol: 'BTC/USDC', details: 'Buy 0.1 BTC @ $67,500 (Limit)', timestamp: '2026-08-27 11:30' },
  { id: 'act-002', customerName: 'Priya Sharma', action: 'Order Filled', symbol: 'ETH/USDC', details: 'Sell 1.5 ETH @ $3,842 (Market)', timestamp: '2026-08-27 10:15' },
  { id: 'act-003', customerName: 'Aisha Al-Rashidi', action: 'Order Placed', symbol: 'BTC/USDC', details: 'Buy 0.5 BTC @ $67,000 (Limit)', timestamp: '2026-08-27 09:00' },
  { id: 'act-004', customerName: 'Alex Morgan', action: 'Position Opened', symbol: 'SOL/USDC', details: 'Long 10 SOL @ $175', timestamp: '2026-08-26 16:00' },
  { id: 'act-005', customerName: 'Marcus Whitfield', action: 'Deposit', symbol: '—', details: '$5,000 USD via Credit Card', timestamp: '2026-08-26 14:00' },
];

export default function AdminTradingActivityContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Trading Activity" subtitle="Recent platform trading events" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Events Today" value={ACTIVITY.length} />
        <KpiCard label="Orders" value={ACTIVITY.filter(a => a.action.includes('Order')).length} />
        <KpiCard label="Positions" value={ACTIVITY.filter(a => a.action.includes('Position')).length} />
        <KpiCard label="Active Traders" value="3" />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'timestamp', label: 'Time', render: (a: any) => <span className="font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.timestamp}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'action', label: 'Action', render: (a: any) => <span style={{ color: 'var(--primary)' }}>{a.action}</span> },
            { key: 'symbol', label: 'Symbol', render: (a: any) => <span className="font-mono">{a.symbol}</span> },
            { key: 'details', label: 'Details', render: (a: any) => <span style={{ color: 'var(--muted-foreground)' }}>{a.details}</span> },
          ]}
          data={ACTIVITY}
        />
      </Card>
    </div>
  );
}
