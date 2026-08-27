'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const TICKETS = [
  { id: 'tkt-001', customerName: 'Alex Morgan', subject: 'Deposit not credited', category: 'Finance', priority: 'high', status: 'open', assignedTo: 'Sarah Chen', createdAt: '2026-08-27 10:00', updatedAt: '2026-08-27 14:00' },
  { id: 'tkt-002', customerName: 'Priya Sharma', subject: 'Verification documents rejected', category: 'Compliance', priority: 'medium', status: 'in_progress', assignedTo: 'James Park', createdAt: '2026-08-27 09:00', updatedAt: '2026-08-27 11:00' },
  { id: 'tkt-003', customerName: 'Marcus Whitfield', subject: 'Cannot login to account', category: 'Technical', priority: 'high', status: 'open', assignedTo: null, createdAt: '2026-08-27 08:00', updatedAt: '2026-08-27 08:00' },
  { id: 'tkt-004', customerName: 'Thomas Bergmann', subject: 'Question about trading fees', category: 'General', priority: 'low', status: 'completed', assignedTo: 'Sarah Chen', createdAt: '2026-08-26 16:00', updatedAt: '2026-08-26 17:00' },
];

export default function AdminTicketsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Support Tickets" subtitle="Customer support ticket management" actions={<ActionButton variant="primary">Create Ticket</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Tickets" value={TICKETS.filter(t => t.status === 'open').length} />
        <KpiCard label="In Progress" value={TICKETS.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Completed" value={TICKETS.filter(t => t.status === 'completed').length} />
        <KpiCard label="Unassigned" value={TICKETS.filter(t => !t.assignedTo).length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'ID', render: (t: any) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{t.id}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'subject', label: 'Subject' },
            { key: 'category', label: 'Category' },
            { key: 'priority', label: 'Priority', render: (t: any) => <StatusBadge status={t.priority} /> },
            { key: 'status', label: 'Status', render: (t: any) => <StatusBadge status={t.status} /> },
            { key: 'assignedTo', label: 'Assigned', render: (t: any) => t.assignedTo || <span style={{ color: '#ef4444' }}>Unassigned</span> },
            { key: 'updatedAt', label: 'Updated' },
            { key: 'actions', label: '', render: () => <ActionButton>View</ActionButton> },
          ]}
          data={TICKETS}
        />
      </Card>
    </div>
  );
}
