'use client';
import React, { useEffect, useState } from 'react';
import { portfolioService, Position, PortfolioAllocation } from '@/services/portfolio.service';
import PortfolioKpis from './PortfolioKpis';
import AllocationChart from './AllocationChart';
import PositionsTable from './PositionsTable';
import TradeHistoryTable from './TradeHistoryTable';

export default function PortfolioContent() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>([]);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof portfolioService.getTradeHistory>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      portfolioService.getPositions(),
      portfolioService.getAllocation(),
      portfolioService.getTradeHistory(),
    ]).then(([pos, alloc, hist]) => {
      setPositions(pos);
      setAllocation(alloc);
      setHistory(hist);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-4 space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={`pf-sk-${i}`} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
          <div className="xl:col-span-2 h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
        </div>
      </div>
    );
  }

  const totalValue = positions.reduce((a, b) => a + b.value, 0) + 12480;
  const totalPnl = positions.reduce((a, b) => a + b.pnl, 0);
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100;
  const totalDeposited = 40000;
  const totalRoi = ((totalValue - totalDeposited) / totalDeposited) * 100;

  return (
    <div className="py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Portfolio</h1>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Account overview · Aug 27, 2026</p>
      </div>

      <PortfolioKpis
        totalValue={totalValue}
        pnl24h={totalPnl}
        pnlPct24h={totalPnlPct}
        totalRoi={totalRoi}
        openPositions={positions.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <AllocationChart allocation={allocation} totalValue={totalValue} />
        <div className="xl:col-span-2">
          <PositionsTable positions={positions} />
        </div>
      </div>

      <TradeHistoryTable history={history} />
    </div>
  );
}