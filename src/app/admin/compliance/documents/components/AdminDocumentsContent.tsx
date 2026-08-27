'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const DOCUMENTS = [
  { id: 'doc-001', customerName: 'Alex Morgan', type: 'Passport', filename: 'passport_alex_morgan.pdf', uploadedAt: '2026-08-20 15:00', status: 'approved', size: '2.4 MB' },
  { id: 'doc-002', customerName: 'Alex Morgan', type: 'Proof of Address', filename: 'utility_bill_aug2026.pdf', uploadedAt: '2026-08-20 15:02', status: 'approved', size: '1.1 MB' },
  { id: 'doc-003', customerName: 'Marcus Whitfield', type: 'National ID', filename: 'national_id_marcus.jpg', uploadedAt: '2026-08-22 10:00', status: 'pending', size: '3.2 MB' },
  { id: 'doc-004', customerName: 'Aisha Al-Rashidi', type: 'Passport', filename: 'passport_aisha.pdf', uploadedAt: '2026-08-24 09:00', status: 'pending', size: '2.8 MB' },
  { id: 'doc-005', customerName: 'Dmitri Volkov', type: 'Passport', filename: 'passport_dmitri.pdf', uploadedAt: '2026-08-25 14:00', status: 'rejected', size: '1.9 MB' },
];

export default function AdminDocumentsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Documents" subtitle="Customer document submissions" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Documents" value={DOCUMENTS.length} />
        <KpiCard label="Pending" value={DOCUMENTS.filter(d => d.status === 'pending').length} />
        <KpiCard label="Approved" value={DOCUMENTS.filter(d => d.status === 'approved').length} />
        <KpiCard label="Rejected" value={DOCUMENTS.filter(d => d.status === 'rejected').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'type', label: 'Document Type' },
            { key: 'filename', label: 'Filename', render: (d: any) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{d.filename}</span> },
            { key: 'size', label: 'Size' },
            { key: 'uploadedAt', label: 'Uploaded' },
            { key: 'status', label: 'Status', render: (d: any) => <StatusBadge status={d.status} /> },
            {
              key: 'actions', label: '',
              render: (d: any) => (
                <div className="flex gap-1">
                  <ActionButton>View</ActionButton>
                  {d.status === 'pending' && <ActionButton variant="primary">Approve</ActionButton>}
                </div>
              )
            },
          ]}
          data={DOCUMENTS}
        />
      </Card>
    </div>
  );
}
