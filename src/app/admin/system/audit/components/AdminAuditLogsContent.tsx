'use client';
import React, { useEffect, useState } from 'react';
import { adminService, AuditLog } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, SearchInput } from '@/components/admin/AdminUI';

export default function AdminAuditLogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { adminService.getAuditLogs().then(d => { setLogs(d); setLoading(false); }); }, []);

  const filtered = logs.filter(l =>
    `${l.staffName} ${l.action} ${l.customerName || ''} ${l.resource}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" subtitle="Complete audit trail of all staff actions" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Events" value={logs.length} />
        <KpiCard label="Today" value={logs.length} />
        <KpiCard label="Failures" value={logs.filter(l => l.result === 'failure').length} />
        <KpiCard label="Staff Actions" value={new Set(logs.map(l => l.staffId)).size} />
      </div>
      <Card padding="p-0">
        <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search audit logs..." />
        </div>
        <AdminTable
          columns={[
            { key: 'timestamp', label: 'Timestamp', render: (l: AuditLog) => <span className="font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{l.timestamp}</span> },
            { key: 'staffName', label: 'Staff' },
            { key: 'action', label: 'Action', render: (l: AuditLog) => <span className="font-mono text-xs" style={{ color: 'var(--primary)' }}>{l.action}</span> },
            { key: 'resource', label: 'Resource' },
            { key: 'customerName', label: 'Customer', render: (l: AuditLog) => l.customerName || '—' },
            { key: 'details', label: 'Details', render: (l: AuditLog) => <span className="truncate max-w-xs block" style={{ color: 'var(--muted-foreground)' }}>{l.details}</span> },
            { key: 'ip', label: 'IP', render: (l: AuditLog) => <span className="font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{l.ip}</span> },
            { key: 'result', label: 'Result', render: (l: AuditLog) => <StatusBadge status={l.result} /> },
          ]}
          data={filtered}
          loading={loading}
        />
      </Card>
    </div>
  );
}
