'use client';
import React, { useEffect, useState } from 'react';
import { agentService, AgentTask } from '@/services/agent.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

export default function AdminTasksContent() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { agentService.getTasks('agent-001').then(d => { setTasks(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" subtitle="All agent tasks across the platform"
        actions={<ActionButton variant="primary">Create Task</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Tasks" value={tasks.length} />
        <KpiCard label="Overdue" value={tasks.filter(t => t.status === 'overdue').length} />
        <KpiCard label="In Progress" value={tasks.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Pending" value={tasks.filter(t => t.status === 'pending').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'type', label: 'Type', render: (r: AgentTask) => <span style={{ color: 'var(--muted-foreground)' }}>{r.type.replace(/_/g, ' ')}</span> },
            { key: 'priority', label: 'Priority', render: (r: AgentTask) => <StatusBadge status={r.priority} /> },
            { key: 'status', label: 'Status', render: (r: AgentTask) => <StatusBadge status={r.status} /> },
            { key: 'dueDate', label: 'Due' },
            { key: 'createdBy', label: 'Created By' },
            { key: 'notes', label: 'Notes', render: (r: AgentTask) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{r.notes}</span> },
          ]}
          data={tasks}
          loading={loading}
        />
      </Card>
    </div>
  );
}
