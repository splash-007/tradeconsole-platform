'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, KpiCard, StatusBadge } from '@/components/admin/AdminUI';

const CAMPAIGNS = [
  { id: 'camp-001', name: 'summer-2026', source: 'Google Ads', registrations: 4820, conversions: 1368, spend: '$24,100', cpa: '$17.62', status: 'active', startDate: '2026-07-01', endDate: '2026-08-31' },
  { id: 'camp-002', name: 'mena-launch', source: 'Affiliate', registrations: 3210, conversions: 796, spend: '$16,050', cpa: '$20.16', status: 'active', startDate: '2026-08-01', endDate: '2026-09-30' },
  { id: 'camp-003', name: 'asia-q3', source: 'Facebook', registrations: 2940, conversions: 535, spend: '$14,700', cpa: '$27.48', status: 'active', startDate: '2026-07-15', endDate: '2026-09-15' },
  { id: 'camp-004', name: 'newsletter-aug', source: 'Email', registrations: 620, conversions: 261, spend: '$1,240', cpa: '$4.75', status: 'completed', startDate: '2026-08-01', endDate: '2026-08-31' },
  { id: 'camp-005', name: 'africa-q3', source: 'YouTube', registrations: 980, conversions: 153, spend: '$4,900', cpa: '$32.03', status: 'active', startDate: '2026-07-01', endDate: '2026-09-30' },
];

export default function AdminCampaignsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Campaigns" subtitle="Marketing campaign performance tracking" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Campaigns" value={CAMPAIGNS.filter(c => c.status === 'active').length} />
        <KpiCard label="Total Registrations" value={CAMPAIGNS.reduce((s, c) => s + c.registrations, 0).toLocaleString()} />
        <KpiCard label="Total Conversions" value={CAMPAIGNS.reduce((s, c) => s + c.conversions, 0).toLocaleString()} />
        <KpiCard label="Best CPA" value="$4.75" sub="newsletter-aug" />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'name', label: 'Campaign', render: (r: any) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{r.name}</span> },
            { key: 'source', label: 'Source' },
            { key: 'registrations', label: 'Registrations', render: (r: any) => r.registrations.toLocaleString() },
            { key: 'conversions', label: 'Conversions', render: (r: any) => r.conversions.toLocaleString() },
            { key: 'spend', label: 'Spend' },
            { key: 'cpa', label: 'CPA' },
            { key: 'startDate', label: 'Start' },
            { key: 'endDate', label: 'End' },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          data={CAMPAIGNS}
        />
      </Card>
    </div>
  );
}
