'use client';
import React, { useEffect, useState } from 'react';
import { adminService, DepositRequest } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

export default function AdminDepositsContent() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getDeposits().then(d => { setDeposits(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Deposits" subtitle="Deposit requests and review queue" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Deposits" value={deposits.length} />
        <KpiCard label="Pending Review" value={deposits.filter(d => d.status === 'pending').length} />
        <KpiCard label="Approved" value={deposits.filter(d => d.status === 'approved').length} />
        <KpiCard label="Total Amount" value={`$${deposits.reduce((s, d) => s + d.amount, 0).toLocaleString()}`} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'ID', render: (d: DepositRequest) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{d.id}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'amount', label: 'Amount', render: (d: DepositRequest) => <span style={{ color: 'var(--positive)' }}>+${d.amount.toLocaleString()}</span> },
            { key: 'currency', label: 'Currency' },
            { key: 'method', label: 'Method' },
            { key: 'status', label: 'Status', render: (d: DepositRequest) => <StatusBadge status={d.status} /> },
            { key: 'submittedAt', label: 'Submitted' },
            { key: 'reviewedBy', label: 'Reviewed By', render: (d: DepositRequest) => d.reviewedBy || '—' },
            {
              key: 'actions', label: '',
              render: (d: DepositRequest) => d.status === 'pending' ? (
                <div className="flex gap-1">
                  <ActionButton variant="primary" onClick={() => adminService.reviewDeposit(d.id, 'approve')}>Approve</ActionButton>
                  <ActionButton variant="danger" onClick={() => adminService.reviewDeposit(d.id, 'reject')}>Reject</ActionButton>
                </div>
              ) : null
            },
          ]}
          data={deposits}
          loading={loading}
        />
      </Card>
    </div>
  );
}
