'use client';
import React, { useEffect, useState } from 'react';
import { marketingService } from '@/services/marketing.service';
import { PageHeader, Card, AdminTable, KpiCard } from '@/components/admin/AdminUI';

export default function AdminSourcesContent() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { marketingService.getSourcePerformance().then(d => { setSources(d); setLoading(false); }); }, []);
  return (
    <div className="space-y-4">
      <PageHeader title="Traffic Sources" subtitle="Registration source performance analytics" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Sources" value={sources.length} />
        <KpiCard label="Top Source" value={sources[0]?.source || '—'} />
        <KpiCard label="Best Conversion" value={sources.sort((a, b) => b.conversion - a.conversion)[0]?.source || '—'} />
        <KpiCard label="Total Registrations" value={sources.reduce((s, r) => s + r.count, 0).toLocaleString()} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'source', label: 'Source' },
            { key: 'count', label: 'Registrations', render: (r: any) => r.count.toLocaleString() },
            { key: 'conversion', label: 'Conv. Rate', render: (r: any) => `${r.conversion}%` },
            { key: 'share', label: 'Share', render: (r: any) => {
              const total = sources.reduce((s, x) => s + x.count, 0);
              const pct = total ? ((r.count / total) * 100).toFixed(1) : '0';
              return (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span>{pct}%</span>
                </div>
              );
            }},
          ]}
          data={sources.map((s, i) => ({ ...s, id: `src-${i}` }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
