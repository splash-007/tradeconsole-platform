'use client';
import React from 'react';
import { PageHeader, Card, AdminTable, KpiCard } from '@/components/admin/AdminUI';

const UTM_DATA = [
  { id: 'utm-001', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'summer-2026', utm_term: 'crypto trading', utm_content: 'banner-a', sessions: 12400, registrations: 1840, conversions: 522 },
  { id: 'utm-002', utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'asia-q3', utm_term: '', utm_content: 'video-1', sessions: 8200, registrations: 1240, conversions: 226 },
  { id: 'utm-003', utm_source: 'affiliate', utm_medium: 'referral', utm_campaign: 'mena-launch', utm_term: '', utm_content: 'link-a', sessions: 6800, registrations: 980, conversions: 243 },
  { id: 'utm-004', utm_source: 'email', utm_medium: 'email', utm_campaign: 'newsletter-aug', utm_term: '', utm_content: 'cta-button', sessions: 2100, registrations: 620, conversions: 261 },
  { id: 'utm-005', utm_source: 'youtube', utm_medium: 'video', utm_campaign: 'africa-q3', utm_term: 'bitcoin', utm_content: 'tutorial', sessions: 3400, registrations: 480, conversions: 75 },
];

export default function AdminUTMContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="UTM Analytics" subtitle="UTM parameter tracking and attribution analysis" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Tracked Sessions" value={UTM_DATA.reduce((s, r) => s + r.sessions, 0).toLocaleString()} />
        <KpiCard label="UTM Registrations" value={UTM_DATA.reduce((s, r) => s + r.registrations, 0).toLocaleString()} />
        <KpiCard label="UTM Conversions" value={UTM_DATA.reduce((s, r) => s + r.conversions, 0).toLocaleString()} />
        <KpiCard label="Top UTM Source" value="google" />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'utm_source', label: 'Source', render: (r: any) => <span style={{ color: 'var(--primary)' }}>{r.utm_source}</span> },
            { key: 'utm_medium', label: 'Medium' },
            { key: 'utm_campaign', label: 'Campaign' },
            { key: 'utm_term', label: 'Term', render: (r: any) => r.utm_term || '—' },
            { key: 'utm_content', label: 'Content' },
            { key: 'sessions', label: 'Sessions', render: (r: any) => r.sessions.toLocaleString() },
            { key: 'registrations', label: 'Registrations', render: (r: any) => r.registrations.toLocaleString() },
            { key: 'conversions', label: 'Conversions', render: (r: any) => r.conversions.toLocaleString() },
          ]}
          data={UTM_DATA}
        />
      </Card>
    </div>
  );
}
