'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Download, UserPlus, Calendar, Globe, Mail, Phone } from 'lucide-react';
import { marketingService, Registration } from '@/services/marketing.service';
import { AdminTable, StatusBadge, PageHeader, Card, SearchInput, ActionButton, KpiCard } from '@/components/admin/AdminUI';
import AssignAgentModal from '@/app/admin/customers/[id]/components/AssignAgentModal';

export default function AdminRegistrationsContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [assignTarget, setAssignTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await marketingService.getRegistrations();
      setRegistrations(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sources = ['all', ...Array.from(new Set(registrations.map(r => r.source).filter(Boolean)))];

  const filtered = registrations.filter(r => {
    const matchSearch = `${r.firstName} ${r.lastName} ${r.email} ${r.country}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSource = sourceFilter === 'all' || r.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const exportCSV = () => {
    // Registration details only — no deposit/financial data (new leads haven't deposited yet)
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Source', 'Affiliate', 'Campaign', 'Registered At', 'Status', 'Assigned Staff'];
    const rows = filtered.map(r => [
      r.id, r.firstName, r.lastName, r.email, r.phone || '', r.country,
      r.source || '', r.affiliate || '', r.campaign || '',
      r.registeredAt, r.status, r.assignedStaff || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Registration-only columns — no deposit/financial columns (new leads haven't deposited)
  const columns = [
    {
      key: 'name', label: 'Lead',
      render: (r: Registration) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.12)', color: 'var(--primary)' }}>
            {r.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{r.firstName} {r.lastName}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <Mail size={9} />{r.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'phone', label: 'Phone',
      render: (r: Registration) => (
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Phone size={10} />{r.phone || '—'}
        </span>
      )
    },
    {
      key: 'country', label: 'Country',
      render: (r: Registration) => (
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Globe size={10} />{r.country}
        </span>
      )
    },
    { key: 'source', label: 'Source', render: (r: Registration) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.source || '—'}</span> },
    { key: 'affiliate', label: 'Affiliate', render: (r: Registration) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.affiliate || '—'}</span> },
    { key: 'campaign', label: 'Campaign', render: (r: Registration) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.campaign || '—'}</span> },
    {
      key: 'registeredAt', label: 'Registered',
      render: (r: Registration) => (
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Calendar size={10} />{r.registeredAt}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (r: Registration) => <StatusBadge status={r.status} /> },
    { key: 'assignedStaff', label: 'Assigned To', render: (r: Registration) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.assignedStaff || '—'}</span> },
    {
      key: 'actions', label: '',
      render: (r: Registration) => (
        <div className="flex gap-1">
          <Link href={`/admin/customers/${r.id}`}><ActionButton>View</ActionButton></Link>
          <ActionButton onClick={() => setAssignTarget({ id: r.id, name: `${r.firstName} ${r.lastName}` })}>Assign</ActionButton>
        </div>
      )
    },
  ];

  const statuses = ['all', 'pending', 'verified', 'active', 'rejected', 'suspended'];

  return (
    <div className="space-y-4">
      <PageHeader title="New Registrations" subtitle="New lead registrations — registration details only (no deposit data at this stage)" />

      {/* KPI cards — registration metrics only, no financial data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Today" value="84" trend={12.5} />
        <KpiCard label="Pending Review" value="23" sub="Awaiting assignment" />
        <KpiCard label="Verified" value="41" trend={8.2} />
        <KpiCard label="Rejected" value="6" sub="This week" />
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)', color: 'var(--muted-foreground)' }}>
        <UserPlus size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
        <span>These are new registrations. Deposit and financial data will appear in the <strong style={{ color: 'var(--foreground)' }}>Customers</strong> section once a lead has been converted and made their first deposit.</span>
      </div>

      <Card padding="p-0">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search registrations..." />
          {/* Status filters */}
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
          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="text-xs px-2 py-1 rounded border outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            {sources.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s}</option>)}
          </select>
          <div className="flex-1" />
          {/* Right-side actions */}
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
        <div className="px-3 py-1.5 border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          Showing {filtered.length} of {registrations.length} registrations
        </div>
        <AdminTable columns={columns} data={filtered} loading={loading} />
      </Card>

      {assignTarget && (
        <AssignAgentModal
          customerId={assignTarget.id}
          customerName={assignTarget.name}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  );
}
