'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { agentService, AssignedCustomer } from '@/services/agent.service';
import { PageHeader, Card, AdminTable, StatusBadge, SearchInput } from '@/components/admin/AdminUI';

const AGENT_ID = 'agent-001';
const ONLINE_DOT: Record<string, string> = { online: '#22c55e', away: '#f59e0b', offline: '#6b7280' };

export default function AgentCustomersContent() {
  const [customers, setCustomers] = useState<AssignedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { agentService.getAssignedCustomers(AGENT_ID).then(d => { setCustomers(d); setLoading(false); }); }, []);

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: (c: AssignedCustomer) => (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ONLINE_DOT[c.onlineStatus] }} />
          <Link href={`/agent/customers/${c.id}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            {c.firstName} {c.lastName}
          </Link>
        </div>
      )
    },
    { key: 'country', label: 'Country', render: (c: AssignedCustomer) => <span style={{ color: 'var(--muted-foreground)' }}>{c.country}</span> },
    { key: 'status', label: 'Status', render: (c: AssignedCustomer) => <StatusBadge status={c.status} /> },
    { key: 'assignedDate', label: 'Assigned', render: (c: AssignedCustomer) => <span style={{ color: 'var(--muted-foreground)' }}>{c.assignedDate}</span> },
    { key: 'priority', label: 'Priority', render: (c: AssignedCustomer) => <StatusBadge status={c.priority} /> },
    { key: 'lastContact', label: 'Last Contact', render: (c: AssignedCustomer) => <span style={{ color: 'var(--muted-foreground)' }}>{c.lastContact || '—'}</span> },
    { key: 'nextAction', label: 'Next Action', render: (c: AssignedCustomer) => <span style={{ color: 'var(--muted-foreground)' }}>{c.nextAction || '—'}</span> },
    { key: 'onlineStatus', label: 'Online', render: (c: AssignedCustomer) => (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ONLINE_DOT[c.onlineStatus] }} />
        <span className="capitalize text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.onlineStatus}</span>
      </div>
    )},
    {
      key: 'actions', label: '',
      render: (c: AssignedCustomer) => <Link href={`/agent/customers/${c.id}`} className="text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>View</Link>
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Customers"
        subtitle={`${filtered.length} assigned customers — phone and email hidden by default`}
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />}
      />
      <div className="p-2 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.2)', backgroundColor: 'rgba(245,196,0,0.04)', color: 'var(--muted-foreground)' }}>
        🔒 PII (phone, email) is hidden by default. Contact your manager to request access for specific customers.
      </div>
      <Card padding="p-0">
        <AdminTable columns={columns} data={filtered} loading={loading} />
      </Card>
    </div>
  );
}
