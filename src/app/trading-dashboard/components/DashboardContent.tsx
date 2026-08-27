'use client';
import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { portfolioService, Position } from '@/services/portfolio.service';
import KpiGrid from './KpiGrid';
import PortfolioChart from './PortfolioChart';
import TopMovers from './TopMovers';
import RecentActivity from './RecentActivity';
import MarketSummary from './MarketSummary';

function buildPortfolioHistory(positions: Position[]): { date: string; value: number }[] {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const cashBalance = 12480;
  const today = new Date('2026-08-27');
  const history: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const progress = (29 - i) / 29;
    const noise = (Math.sin(i * 2.5) * 0.03 + Math.cos(i * 1.7) * 0.02);
    const value = Math.round((cashBalance + totalValue * (0.82 + progress * 0.18 + noise)) * 100) / 100;
    history.push({ date: dateStr, value });
  }
  return history;
}

export default function DashboardContent() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getOverview(),
      marketsService.getInstruments(),
      portfolioService.getPositions(),
    ]).then(([ov, inst, pos]) => {
      setOverview(ov);
      setInstruments(inst);
      setPositions(pos);
      setLoading(false);
    });
  }, []);

  const portfolioHistory = positions.length > 0 ? buildPortfolioHistory(positions) : overview?.portfolioHistory ?? [];

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
          <PortfolioChart history={portfolioHistory} positions={positions} />
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