'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Download } from 'lucide-react';
import { marketingService, Registration } from '@/services/marketing.service';
import { AdminTable, StatusBadge, PageHeader, Card, SearchInput, ActionButton } from '@/components/admin/AdminUI';

export default function AdminCustomersContent() {
  const [customers, setCustomers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await marketingService.getRegistrations();
      setCustomers(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statuses = ['all', 'pending', 'verified', 'active', 'rejected', 'suspended'];
  const countries = ['all', ...Array.from(new Set(customers.map(c => c.country).filter(Boolean)))];

  const filtered = customers.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.email} ${c.country}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchCountry = countryFilter === 'all' || c.country === countryFilter;
    return matchSearch && matchStatus && matchCountry;
  });

  const exportCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Country', 'Source', 'Affiliate', 'Registered At', 'Status', 'Assigned Staff'];
    const rows = filtered.map(c => [
      c.id, c.firstName, c.lastName, c.email, c.country,
      c.source || '', c.affiliate || '', c.registeredAt, c.status, c.assignedStaff || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <Link href={`/admin/customers/${r.id}`}><ActionButton>View</ActionButton></Link>
          <Link href={`/admin/customers/${r.id}?tab=assign`}><ActionButton>Assign</ActionButton></Link>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" subtitle={`${filtered.length} of ${customers.length} customers`} />
      <Card padding="p-0">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
          {/* Status filter */}
          <div className="flex gap-1 flex-wrap">
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
          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="text-xs px-2 py-1 rounded border outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            {countries.map(c => <option key={c} value={c}>{c === 'all' ? 'All Countries' : c}</option>)}
          </select>
          <div className="flex-1" />
          {/* Right-side: Refresh + Export CSV */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'transparent' }}
              title="Refresh data"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--primary)', color: '#000', backgroundColor: 'var(--primary)' }}
            >
              <Download size={12} />
              Export CSV
            </button>
          </div>
        </div>
        <AdminTable columns={columns} data={filtered} loading={loading} emptyMessage="No customers found" />
      </Card>
    </div>
  );
}
