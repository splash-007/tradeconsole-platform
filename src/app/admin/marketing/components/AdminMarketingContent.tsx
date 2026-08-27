'use client';
import React, { useEffect, useState } from 'react';
import { marketingService } from '@/services/marketing.service';
import { PageHeader, Card, KpiCard, AdminTable } from '@/components/admin/AdminUI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminMarketingContent() {
  const [overview, setOverview] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      marketingService.getOverview(),
      marketingService.getRegistrationTimeline(),
      marketingService.getSourcePerformance(),
    ]).then(([ov, tl, src]) => {
      setOverview(ov);
      setTimeline(tl);
      setSources(src);
      setLoading(false);
    });
  }, []);

  const tooltipStyle = { backgroundColor: '#111', border: '1px solid #333', borderRadius: 6, fontSize: 11 };

  return (
    <div className="space-y-4">
      <PageHeader title="Marketing Overview" subtitle="Registration analytics and attribution performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Registrations" value={overview?.totalRegistrations?.toLocaleString() || '—'} />
        <KpiCard label="Today" value={overview?.registrationsToday || '—'} trend={12.5} />
        <KpiCard label="Last 7 Days" value={overview?.registrationsLast7Days || '—'} trend={8.2} />
        <KpiCard label="Conversion Rate" value={`${overview?.conversionRate || 0}%`} trend={1.4} />
        <KpiCard label="Qualified" value={overview?.qualifiedCustomers?.toLocaleString() || '—'} />
        <KpiCard label="Conversions" value={overview?.conversions?.toLocaleString() || '—'} />
        <KpiCard label="Top Source" value={overview?.topSource || '—'} />
        <KpiCard label="Top Country" value={overview?.topCountry || '—'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Registrations Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={timeline}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Source Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sources} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="source" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Source Breakdown</h3>
        <AdminTable
          columns={[
            { key: 'source', label: 'Source' },
            { key: 'count', label: 'Registrations', render: (r: any) => r.count.toLocaleString() },
            { key: 'conversion', label: 'Conversion Rate', render: (r: any) => `${r.conversion}%` },
          ]}
          data={sources.map((s, i) => ({ ...s, id: `src-${i}` }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
