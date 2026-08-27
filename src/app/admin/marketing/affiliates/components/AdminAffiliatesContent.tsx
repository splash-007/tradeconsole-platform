'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, KpiCard, StatusBadge } from '@/components/admin/AdminUI';

const AFFILIATES = [
  { id: 'AFF-0042', name: 'TopTrader Media', registrations: 4820, conversions: 1368, rate: 28.4, revenue: '$68,400', status: 'active', country: 'UK' },
  { id: 'AFF-0099', name: 'MENA Finance Hub', registrations: 3210, conversions: 796, rate: 24.8, revenue: '$39,800', status: 'active', country: 'UAE' },
  { id: 'AFF-0018', name: 'Asia Crypto Network', registrations: 2940, conversions: 535, rate: 18.2, revenue: '$26,750', status: 'active', country: 'SG' },
  { id: 'AFF-0055', name: 'Africa Digital', registrations: 980, conversions: 153, rate: 15.6, revenue: '$7,650', status: 'active', country: 'NG' },
  { id: 'AFF-0077', name: 'APAC Partners', registrations: 410, conversions: 52, rate: 12.8, revenue: '$2,600', status: 'paused', country: 'JP' },
];

export default function AdminAffiliatesContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Affiliates" subtitle="Affiliate partner performance and attribution" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Affiliates" value={AFFILIATES.filter(a => a.status === 'active').length} />
        <KpiCard label="Total Registrations" value={AFFILIATES.reduce((s, a) => s + a.registrations, 0).toLocaleString()} />
        <KpiCard label="Total Conversions" value={AFFILIATES.reduce((s, a) => s + a.conversions, 0).toLocaleString()} />
        <KpiCard label="Top Affiliate" value="AFF-0042" />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'Affiliate ID', render: (r: any) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{r.id}</span> },
            { key: 'name', label: 'Name' },
            { key: 'country', label: 'Country' },
            { key: 'registrations', label: 'Registrations', render: (r: any) => r.registrations.toLocaleString() },
            { key: 'conversions', label: 'Conversions', render: (r: any) => r.conversions.toLocaleString() },
            { key: 'rate', label: 'Conv. Rate', render: (r: any) => `${r.rate}%` },
            { key: 'revenue', label: 'Revenue' },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          data={AFFILIATES}
        />
      </Card>
    </div>
  );
}
