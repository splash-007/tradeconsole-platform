'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const NOTIFICATIONS = [
  { id: 'notif-001', title: 'Deposit Approved', message: 'Your deposit of $10,000 has been approved', recipient: 'Alex Morgan', type: 'finance', status: 'sent', sentAt: '2026-08-27 10:05' },
  { id: 'notif-002', title: 'KYC Approved', message: 'Your identity verification has been approved', recipient: 'Priya Sharma', type: 'compliance', status: 'sent', sentAt: '2026-08-27 09:30' },
  { id: 'notif-003', title: 'Welcome to CryptoVault', message: 'Your account is ready. Start trading today!', recipient: 'Thomas Bergmann', type: 'system', status: 'pending', sentAt: null },
  { id: 'notif-004', title: 'Document Required', message: 'Please upload proof of address to complete verification', recipient: 'Aisha Al-Rashidi', type: 'compliance', status: 'sent', sentAt: '2026-08-27 08:00' },
];

export default function AdminNotificationsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle="System notification management" actions={<ActionButton variant="primary">Send Notification</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Sent" value={NOTIFICATIONS.filter(n => n.status === 'sent').length} />
        <KpiCard label="Pending" value={NOTIFICATIONS.filter(n => n.status === 'pending').length} />
        <KpiCard label="Recipients" value={new Set(NOTIFICATIONS.map(n => n.recipient)).size} />
        <KpiCard label="Types" value={new Set(NOTIFICATIONS.map(n => n.type)).size} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'title', label: 'Title', render: (n: any) => <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{n.title}</span> },
            { key: 'recipient', label: 'Recipient' },
            { key: 'type', label: 'Type', render: (n: any) => <StatusBadge status={n.type} /> },
            { key: 'message', label: 'Message', render: (n: any) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{n.message}</span> },
            { key: 'status', label: 'Status', render: (n: any) => <StatusBadge status={n.status} /> },
            { key: 'sentAt', label: 'Sent At', render: (n: any) => n.sentAt || '—' },
          ]}
          data={NOTIFICATIONS}
        />
      </Card>
    </div>
  );
}
