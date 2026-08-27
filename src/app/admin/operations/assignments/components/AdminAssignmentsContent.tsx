'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const ASSIGNMENTS = [
  { id: 'asgn-001', customerName: 'Alex Morgan', agentName: 'Sarah Chen', priority: 'high', taskType: 'call_customer', dueDate: '2026-08-27', status: 'in_progress', assignedAt: '2026-08-27 08:00', assignedBy: 'Admin' },
  { id: 'asgn-002', customerName: 'Aisha Al-Rashidi', agentName: 'Sarah Chen', priority: 'urgent', taskType: 'follow_up', dueDate: '2026-08-27', status: 'in_progress', assignedAt: '2026-08-27 07:30', assignedBy: 'Admin' },
  { id: 'asgn-003', customerName: 'Marcus Whitfield', agentName: 'James Park', priority: 'medium', taskType: 'verify_information', dueDate: '2026-08-28', status: 'pending', assignedAt: '2026-08-26 15:00', assignedBy: 'James Park' },
  { id: 'asgn-004', customerName: 'Thomas Bergmann', agentName: 'Sarah Chen', priority: 'medium', taskType: 'contact_customer', dueDate: '2026-08-27', status: 'pending', assignedAt: '2026-08-26 18:00', assignedBy: 'Admin' },
  { id: 'asgn-005', customerName: 'Priya Sharma', agentName: 'Sarah Chen', priority: 'low', taskType: 'review_registration', dueDate: '2026-08-26', status: 'overdue', assignedAt: '2026-08-25 10:00', assignedBy: 'Admin' },
];

export default function AdminAssignmentsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Assignments" subtitle="Customer-agent assignment management"
        actions={<ActionButton variant="primary">New Assignment</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Active" value={ASSIGNMENTS.filter(a => a.status !== 'completed').length} />
        <KpiCard label="Overdue" value={ASSIGNMENTS.filter(a => a.status === 'overdue').length} />
        <KpiCard label="Pending" value={ASSIGNMENTS.filter(a => a.status === 'pending').length} />
        <KpiCard label="In Progress" value={ASSIGNMENTS.filter(a => a.status === 'in_progress').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'agentName', label: 'Agent' },
            { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
            { key: 'taskType', label: 'Task', render: (r: any) => <span style={{ color: 'var(--muted-foreground)' }}>{r.taskType.replace(/_/g, ' ')}</span> },
            { key: 'dueDate', label: 'Due' },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
            { key: 'assignedAt', label: 'Assigned' },
            { key: 'assignedBy', label: 'By' },
          ]}
          data={ASSIGNMENTS}
        />
      </Card>
    </div>
  );
}
