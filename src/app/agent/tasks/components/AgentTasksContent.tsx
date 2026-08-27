'use client';
import React, { useEffect, useState } from 'react';
import { agentService, AgentTask, TaskStatus } from '@/services/agent.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

const AGENT_ID = 'agent-001';

export default function AgentTasksContent() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { agentService.getTasks(AGENT_ID).then(d => { setTasks(d); setLoading(false); }); }, []);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    await agentService.updateTaskStatus(taskId, status);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];

  return (
    <div className="space-y-4">
      <PageHeader title="My Tasks" subtitle="Tasks assigned to you" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total" value={tasks.length} />
        <KpiCard label="Overdue" value={tasks.filter(t => t.status === 'overdue').length} />
        <KpiCard label="In Progress" value={tasks.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Pending" value={tasks.filter(t => t.status === 'pending').length} />
      </div>
      <Card padding="p-0">
        <div className="flex gap-1 p-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {['all', ...statuses].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="text-xs px-2.5 py-1 rounded capitalize whitespace-nowrap transition-colors"
              style={{
                backgroundColor: filter === s ? 'var(--primary)' : 'transparent',
                color: filter === s ? '#000' : 'var(--muted-foreground)',
                border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
              }}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'type', label: 'Type', render: (t: AgentTask) => <span style={{ color: 'var(--muted-foreground)' }}>{t.type.replace(/_/g, ' ')}</span> },
            { key: 'priority', label: 'Priority', render: (t: AgentTask) => <StatusBadge status={t.priority} /> },
            { key: 'status', label: 'Status', render: (t: AgentTask) => <StatusBadge status={t.status} /> },
            { key: 'dueDate', label: 'Due' },
            { key: 'notes', label: 'Notes', render: (t: AgentTask) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{t.notes}</span> },
            {
              key: 'actions', label: 'Update',
              render: (t: AgentTask) => (
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value as TaskStatus)}
                  className="text-xs px-2 py-1 rounded border outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              )
            },
          ]}
          data={filtered}
          loading={loading}
        />
      </Card>
    </div>
  );
}
