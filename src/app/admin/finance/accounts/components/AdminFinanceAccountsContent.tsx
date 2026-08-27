'use client';
import React, { useEffect, useState } from 'react';
import { adminService, FinanceAccount } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

export default function AdminFinanceAccountsContent() {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getAccounts().then(d => { setAccounts(d); setLoading(false); }); }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.totalBalance, 0);
  const totalAvailable = accounts.reduce((s, a) => s + a.availableBalance, 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Accounts" subtitle="Customer account balances and status" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Accounts" value={accounts.length} />
        <KpiCard label="Total Balance" value={`$${totalBalance.toLocaleString()}`} />
        <KpiCard label="Available" value={`$${totalAvailable.toLocaleString()}`} />
        <KpiCard label="Active Accounts" value={accounts.filter(a => a.status === 'active').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'currency', label: 'Currency' },
            { key: 'availableBalance', label: 'Available', render: (a: FinanceAccount) => `$${a.availableBalance.toLocaleString()}` },
            { key: 'reservedBalance', label: 'Reserved', render: (a: FinanceAccount) => `$${a.reservedBalance.toLocaleString()}` },
            { key: 'totalBalance', label: 'Total', render: (a: FinanceAccount) => <span className="font-bold" style={{ color: 'var(--primary)' }}>${a.totalBalance.toLocaleString()}</span> },
            { key: 'status', label: 'Status', render: (a: FinanceAccount) => <StatusBadge status={a.status} /> },
            { key: 'createdAt', label: 'Created' },
          ]}
          data={accounts}
          loading={loading}
        />
      </Card>
    </div>
  );
}
