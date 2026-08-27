'use client';
import React, { useEffect, useState } from 'react';
import { adminService, Transaction } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

export default function AdminTransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getTransactions().then(d => { setTransactions(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Transactions" subtitle="All platform transaction records" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Transactions" value={transactions.length} />
        <KpiCard label="Deposits" value={transactions.filter(t => t.type === 'deposit').length} />
        <KpiCard label="Withdrawals" value={transactions.filter(t => t.type === 'withdrawal').length} />
        <KpiCard label="Pending" value={transactions.filter(t => t.status === 'pending').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'reference', label: 'Reference', render: (t: Transaction) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{t.reference}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'type', label: 'Type', render: (t: Transaction) => <StatusBadge status={t.type} /> },
            { key: 'amount', label: 'Amount', render: (t: Transaction) => (
              <span style={{ color: t.amount >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
              </span>
            )},
            { key: 'currency', label: 'Currency' },
            { key: 'status', label: 'Status', render: (t: Transaction) => <StatusBadge status={t.status} /> },
            { key: 'createdAt', label: 'Date' },
          ]}
          data={transactions}
          loading={loading}
        />
      </Card>
    </div>
  );
}
