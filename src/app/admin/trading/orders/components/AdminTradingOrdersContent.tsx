'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

const ORDERS = [
  { id: 'ord-001', customerId: 'cust-001', customerName: 'Alex Morgan', symbol: 'BTC/USDC', side: 'buy', type: 'limit', price: 67500, amount: 0.1, total: 6750, status: 'filled', createdAt: '2026-08-27 11:30' },
  { id: 'ord-002', customerId: 'cust-003', customerName: 'Priya Sharma', symbol: 'ETH/USDC', side: 'sell', type: 'market', price: 3842, amount: 1.5, total: 5763, status: 'filled', createdAt: '2026-08-27 10:15' },
  { id: 'ord-003', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', symbol: 'BTC/USDC', side: 'buy', type: 'limit', price: 67000, amount: 0.5, total: 33500, status: 'open', createdAt: '2026-08-27 09:00' },
  { id: 'ord-004', customerId: 'cust-001', customerName: 'Alex Morgan', symbol: 'SOL/USDC', side: 'buy', type: 'market', price: 182, amount: 10, total: 1820, status: 'filled', createdAt: '2026-08-26 16:00' },
];

export default function AdminTradingOrdersContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Orders" subtitle="All customer trading orders" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Orders" value={ORDERS.length} />
        <KpiCard label="Open" value={ORDERS.filter(o => o.status === 'open').length} />
        <KpiCard label="Filled" value={ORDERS.filter(o => o.status === 'filled').length} />
        <KpiCard label="Total Volume" value={`$${ORDERS.reduce((s, o) => s + o.total, 0).toLocaleString()}`} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'Order ID', render: (o: any) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{o.id}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'symbol', label: 'Symbol', render: (o: any) => <span className="font-mono">{o.symbol}</span> },
            { key: 'side', label: 'Side', render: (o: any) => <span style={{ color: o.side === 'buy' ? 'var(--positive)' : 'var(--negative)', textTransform: 'uppercase', fontWeight: 600 }}>{o.side}</span> },
            { key: 'type', label: 'Type', render: (o: any) => <span style={{ color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{o.type}</span> },
            { key: 'price', label: 'Price', render: (o: any) => `$${o.price.toLocaleString()}` },
            { key: 'amount', label: 'Amount', render: (o: any) => o.amount },
            { key: 'total', label: 'Total', render: (o: any) => `$${o.total.toLocaleString()}` },
            { key: 'status', label: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
            { key: 'createdAt', label: 'Date' },
          ]}
          data={ORDERS}
        />
      </Card>
    </div>
  );
}
