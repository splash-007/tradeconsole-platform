'use client';
import React, { useEffect, useState } from 'react';
import { adminService, WithdrawalRequest } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

export default function AdminWithdrawalsContent() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getWithdrawals().then(d => { setWithdrawals(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Withdrawals" subtitle="Withdrawal requests and review queue" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Requests" value={withdrawals.length} />
        <KpiCard label="Pending Review" value={withdrawals.filter(w => w.status === 'pending').length} />
        <KpiCard label="Approved" value={withdrawals.filter(w => w.status === 'approved').length} />
        <KpiCard label="Total Amount" value={`$${withdrawals.reduce((s, w) => s + w.amount, 0).toLocaleString()}`} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'ID', render: (w: WithdrawalRequest) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{w.id}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'amount', label: 'Amount', render: (w: WithdrawalRequest) => <span style={{ color: 'var(--negative)' }}>-${w.amount.toLocaleString()}</span> },
            { key: 'currency', label: 'Currency' },
            { key: 'method', label: 'Method' },
            { key: 'destination', label: 'Destination' },
            { key: 'status', label: 'Status', render: (w: WithdrawalRequest) => <StatusBadge status={w.status} /> },
            { key: 'submittedAt', label: 'Submitted' },
            {
              key: 'actions', label: '',
              render: (w: WithdrawalRequest) => w.status === 'pending' ? (
                <div className="flex gap-1">
                  <ActionButton variant="primary" onClick={() => adminService.reviewWithdrawal(w.id, 'approve')}>Approve</ActionButton>
                  <ActionButton variant="danger" onClick={() => adminService.reviewWithdrawal(w.id, 'reject')}>Reject</ActionButton>
                </div>
              ) : null
            },
          ]}
          data={withdrawals}
          loading={loading}
        />
      </Card>
    </div>
  );
}
