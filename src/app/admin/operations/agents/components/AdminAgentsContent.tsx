'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { agentService, Agent } from '@/services/agent.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

const STATUS_DOT: Record<string, string> = { online: '#22c55e', busy: '#F5C400', away: '#f59e0b', offline: '#6b7280' };

export default function AdminAgentsContent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { agentService.getAgents().then(d => { setAgents(d); setLoading(false); }); }, []);

  const columns = [
    {
      key: 'name', label: 'Agent',
      render: (a: Agent) => (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[a.status] }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>{a.firstName} {a.lastName}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.email}</p>
          </div>
        </div>
      )
    },
    { key: 'status', label: 'Status', render: (a: Agent) => <StatusBadge status={a.status} /> },
    { key: 'role', label: 'Role', render: (a: Agent) => <span style={{ color: 'var(--muted-foreground)' }}>{a.role}</span> },
    { key: 'assignedCustomers', label: 'Customers', render: (a: Agent) => <span style={{ color: 'var(--foreground)' }}>{a.assignedCustomers}</span> },
    { key: 'openTasks', label: 'Open Tasks', render: (a: Agent) => <span style={{ color: 'var(--foreground)' }}>{a.openTasks}</span> },
    { key: 'callsToday', label: 'Calls Today', render: (a: Agent) => <span style={{ color: 'var(--foreground)' }}>{a.callsToday}</span> },
    { key: 'unreadConversations', label: 'Unread', render: (a: Agent) => (
      <span style={{ color: a.unreadConversations > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>{a.unreadConversations}</span>
    )},
    { key: 'lastActive', label: 'Last Active', render: (a: Agent) => <span style={{ color: 'var(--muted-foreground)' }}>{a.lastActive}</span> },
    {
      key: 'actions', label: '',
      render: (a: Agent) => (
        <div className="flex gap-1">
          <Link href={`/admin/operations/agents/${a.id}`}><ActionButton>View</ActionButton></Link>
          <ActionButton>Permissions</ActionButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Agents" subtitle="Agent management and performance overview" actions={<ActionButton variant="primary">Add Agent</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Agents" value={agents.length} />
        <KpiCard label="Online" value={agents.filter(a => a.status === 'online').length} />
        <KpiCard label="Total Assigned" value={agents.reduce((s, a) => s + a.assignedCustomers, 0)} />
        <KpiCard label="Open Tasks" value={agents.reduce((s, a) => s + a.openTasks, 0)} />
      </div>
      <Card padding="p-0">
        <AdminTable columns={columns} data={agents} loading={loading} />
      </Card>
    </div>
  );
}
