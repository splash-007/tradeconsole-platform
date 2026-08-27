'use client';
import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import KpiGrid from './KpiGrid';
import PortfolioChart from './PortfolioChart';
import TopMovers from './TopMovers';
import RecentActivity from './RecentActivity';
import MarketSummary from './MarketSummary';

export default function DashboardContent() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.getOverview(), marketsService.getInstruments()])
      .then(([ov, inst]) => {
        setOverview(ov);
        setInstruments(inst);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Welcome back, Alex · Last updated Aug 27, 14:45 UTC</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--positive)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Live</span>
        </div>
      </div>

      {/* KPI bento grid */}
      {overview && <KpiGrid overview={overview} />}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {overview && <PortfolioChart history={overview.portfolioHistory} />}
        </div>
        <div>
          <TopMovers instruments={instruments.slice(0, 6)} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {overview && <RecentActivity activities={overview.recentActivity} />}
        </div>
        <div>
          <MarketSummary instruments={instruments} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="py-4 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--muted)' }} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={`sk-kpi-${i}`} className={`h-28 rounded-lg ${i === 0 ? 'col-span-2' : ''}`} style={{ backgroundColor: 'var(--card)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-64 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
        <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
      </div>
    </div>
  );
}