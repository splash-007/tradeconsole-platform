'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { marketingService, Registration } from '@/services/marketing.service';
import { AdminTable, StatusBadge, PageHeader, Card, SearchInput, ActionButton, KpiCard } from '@/components/admin/AdminUI';

export default function AdminRegistrationsContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    marketingService.getRegistrations().then(data => {
      setRegistrations(data);
      setLoading(false);
    });
  }, []);

  const filtered = registrations.filter(r => {
    const matchSearch = `${r.firstName} ${r.lastName} ${r.email} ${r.country}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: (r: Registration) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>{r.firstName} {r.lastName}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.email}</p>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.phone}</span> },
    { key: 'country', label: 'Country', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.country}</span> },
    { key: 'source', label: 'Source', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.source}</span> },
    { key: 'affiliate', label: 'Affiliate', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.affiliate || '—'}</span> },
    { key: 'campaign', label: 'Campaign', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.campaign || '—'}</span> },
    { key: 'registeredAt', label: 'Date', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.registeredAt}</span> },
    { key: 'status', label: 'Status', render: (r: Registration) => <StatusBadge status={r.status} /> },
    { key: 'assignedStaff', label: 'Assigned', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.assignedStaff || '—'}</span> },
    {
      key: 'actions', label: '',
      render: (r: Registration) => (
        <div className="flex gap-1">
          <Link href={`/admin/customers/${r.id}`}><ActionButton>View</ActionButton></Link>
          <ActionButton>Assign</ActionButton>
        </div>
      )
    },
  ];

  const statuses = ['all', 'pending', 'verified', 'active', 'rejected', 'suspended'];

  return (
    <div className="space-y-4">
      <PageHeader title="Registrations" subtitle="New customer registrations and lead management" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Today" value="84" trend={12.5} />
        <KpiCard label="Pending Review" value="23" sub="Awaiting assignment" />
        <KpiCard label="Verified" value="41" trend={8.2} />
        <KpiCard label="Rejected" value="6" sub="This week" />
      </div>

      <Card padding="p-0">
        <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search registrations..." />
          <div className="flex gap-1">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="text-xs px-2.5 py-1 rounded capitalize transition-colors"
                style={{
                  backgroundColor: statusFilter === s ? 'var(--primary)' : 'transparent',
                  color: statusFilter === s ? '#000' : 'var(--muted-foreground)',
                  border: `1px solid ${statusFilter === s ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <ActionButton variant="primary">Export CSV</ActionButton>
        </div>
        <AdminTable columns={columns} data={filtered} loading={loading} />
      </Card>
    </div>
  );
}
