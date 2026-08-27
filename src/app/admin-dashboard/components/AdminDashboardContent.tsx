'use client';
import React, { useEffect, useState } from 'react';
import { marketingService, MarketingOverview, Registration } from '@/services/marketing.service';
import AdminKpis from './AdminKpis';
import RegistrationsChart from './RegistrationsChart';
import SourcePerformanceChart from './SourcePerformanceChart';
import RegistrationsTable from './RegistrationsTable';

export default function AdminDashboardContent() {
  const [overview, setOverview] = useState<MarketingOverview | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; count: number }[]>([]);
  const [sources, setSources] = useState<{ source: string; count: number; conversion: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      marketingService.getOverview(),
      marketingService.getRegistrations(),
      marketingService.getRegistrationTimeline(),
      marketingService.getSourcePerformance(),
    ]).then(([ov, regs, tl, src]) => {
      setOverview(ov);
      setRegistrations(regs);
      setTimeline(tl);
      setSources(src);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => <div key={`adm-sk-${i}`} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="grid xl:grid-cols-2 gap-4">
          {Array.from({ length: 2 }, (_, i) => <div key={`adm-chart-sk-${i}`} className="h-64 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="h-96 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Marketing Overview</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Aug 27, 2026 · Registrations & Attribution Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--positive)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Live data</span>
        </div>
      </div>

      {/* KPIs */}
      {overview && <AdminKpis overview={overview} />}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RegistrationsChart data={timeline} />
        <SourcePerformanceChart data={sources} />
      </div>

      {/* Registrations table */}
      <RegistrationsTable registrations={registrations} />
    </div>
  );
}