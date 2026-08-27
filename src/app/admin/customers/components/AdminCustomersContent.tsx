'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { marketingService, Registration } from '@/services/marketing.service';
import { AdminTable, StatusBadge, PageHeader, Card, SearchInput, ActionButton } from '@/components/admin/AdminUI';

export default function AdminCustomersContent() {
  const [customers, setCustomers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    marketingService.getRegistrations().then(data => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: (r: Registration) => (
        <div>
          <Link href={`/admin/customers/${r.id}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            {r.firstName} {r.lastName}
          </Link>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.email}</p>
        </div>
      )
    },
    { key: 'country', label: 'Country', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.country}</span> },
    { key: 'source', label: 'Source', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.source}</span> },
    { key: 'affiliate', label: 'Affiliate', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.affiliate || '—'}</span> },
    { key: 'registeredAt', label: 'Registered', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.registeredAt}</span> },
    { key: 'status', label: 'Status', render: (r: Registration) => <StatusBadge status={r.status} /> },
    { key: 'assignedStaff', label: 'Assigned', render: (r: Registration) => <span style={{ color: 'var(--muted-foreground)' }}>{r.assignedStaff || '—'}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r: Registration) => (
        <div className="flex gap-1">
          <Link href={`/admin/customers/${r.id}`}>
            <ActionButton>View</ActionButton>
          </Link>
          <Link href={`/admin/customers/${r.id}?tab=assign`}>
            <ActionButton>Assign</ActionButton>
          </Link>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        subtitle={`${filtered.length} customers`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
            <ActionButton variant="primary">Export</ActionButton>
          </>
        }
      />
      <Card padding="p-0">
        <AdminTable columns={columns} data={filtered} loading={loading} emptyMessage="No customers found" />
      </Card>
    </div>
  );
}
