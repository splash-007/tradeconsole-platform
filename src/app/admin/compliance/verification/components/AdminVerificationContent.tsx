'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const VERIFICATIONS = [
  { id: 'kyc-001', customerName: 'Alex Morgan', country: 'UK', submittedAt: '2026-08-20 15:00', status: 'verified', reviewedBy: 'Sarah Chen', documents: 3 },
  { id: 'kyc-002', customerName: 'Marcus Whitfield', country: 'UK', submittedAt: '2026-08-22 10:00', status: 'pending', reviewedBy: null, documents: 2 },
  { id: 'kyc-003', customerName: 'Priya Sharma', country: 'India', submittedAt: '2026-08-23 12:00', status: 'verified', reviewedBy: 'James Park', documents: 3 },
  { id: 'kyc-004', customerName: 'Aisha Al-Rashidi', country: 'UAE', submittedAt: '2026-08-24 09:00', status: 'pending', reviewedBy: null, documents: 1 },
  { id: 'kyc-005', customerName: 'Dmitri Volkov', country: 'Russia', submittedAt: '2026-08-25 14:00', status: 'rejected', reviewedBy: 'Sarah Chen', documents: 2 },
];

export default function AdminVerificationContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Verification" subtitle="KYC verification queue and status" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Submissions" value={VERIFICATIONS.length} />
        <KpiCard label="Pending Review" value={VERIFICATIONS.filter(v => v.status === 'pending').length} />
        <KpiCard label="Verified" value={VERIFICATIONS.filter(v => v.status === 'verified').length} />
        <KpiCard label="Rejected" value={VERIFICATIONS.filter(v => v.status === 'rejected').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'country', label: 'Country' },
            { key: 'documents', label: 'Documents', render: (v: any) => `${v.documents} files` },
            { key: 'submittedAt', label: 'Submitted' },
            { key: 'status', label: 'Status', render: (v: any) => <StatusBadge status={v.status} /> },
            { key: 'reviewedBy', label: 'Reviewed By', render: (v: any) => v.reviewedBy || '—' },
            {
              key: 'actions', label: '',
              render: (v: any) => v.status === 'pending' ? (
                <div className="flex gap-1">
                  <ActionButton variant="primary">Review</ActionButton>
                </div>
              ) : <ActionButton>View</ActionButton>
            },
          ]}
          data={VERIFICATIONS}
        />
      </Card>
    </div>
  );
}
