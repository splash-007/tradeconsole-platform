'use client';
import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { portfolioService, Position } from '@/services/portfolio.service';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import KpiGrid from './KpiGrid';
import PortfolioChart from './PortfolioChart';
import TopMovers from './TopMovers';
import RecentActivity from './RecentActivity';
import MarketSummary from './MarketSummary';
import { DollarSign, Shield, ArrowUpFromLine, X, TrendingUp, Bell, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { kycService, KYCStatus } from '@/services/kyc.service';

interface ClientNotification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'kyc' | 'trade' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'normal';
}

const NOTIF_STORAGE_KEY = 'cv-dashboard-notifs-read';

const DASHBOARD_NOTIFICATIONS: ClientNotification[] = [
  { id: 'dn-001', type: 'deposit', title: 'Deposit Confirmed', message: '$2,500 USDC has been credited to your account', time: '2 min ago', read: false, priority: 'high' },
  { id: 'dn-002', type: 'kyc', title: 'KYC Under Review', message: 'Your documents are under review. Expected: 24–48 hours', time: '1 hr ago', read: false, priority: 'high' },
  { id: 'dn-003', type: 'withdrawal', title: 'Withdrawal Processing', message: '$500 USDC withdrawal is being processed', time: '3 hrs ago', read: false, priority: 'normal' },
];

const NOTIF_META: Record<string, { icon: React.ElementType; color: string; bg: string; accent: string }> = {
  deposit:    { icon: DollarSign,      color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   accent: 'rgba(34,197,94,0.25)' },
  withdrawal: { icon: ArrowUpFromLine, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  accent: 'rgba(245,158,11,0.25)' },
  kyc:        { icon: Shield,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  accent: 'rgba(59,130,246,0.25)' },
  trade:      { icon: TrendingUp,      color: '#F5C400', bg: 'rgba(245,196,0,0.08)',   accent: 'rgba(245,196,0,0.25)' },
  system:     { icon: Zap,             color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', accent: 'rgba(167,139,250,0.25)' },
};

const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

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
  // KYC state — structured for future API fields: kycStatus, kycRequired, kycCompletedAt
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_started');
  const [kycRequired] = useState<boolean>(true); // Will come from API: kycRequired field
  const [notifications, setNotifications] = useState<ClientNotification[]>(() => {
    // Load persisted read state on init
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (saved) {
          const readIds: string[] = JSON.parse(saved);
          return DASHBOARD_NOTIFICATIONS.map(n => ({ ...n, read: readIds.includes(n.id) ? true : n.read }));
        }
      } catch {}
    }
    return DASHBOARD_NOTIFICATIONS;
  });
  const [lastUpdated, setLastUpdated] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Live market data from Binance WebSocket
  const { quotes } = useRealTimeMarket(LIVE_SYMBOLS);

  useEffect(() => {
    Promise.all([
      dashboardService.getOverview(),
      marketsService.getInstruments(),
      portfolioService.getPositions(),
      kycService.getKYCStatus('cust-001'),
    ]).then(([ov, inst, pos, kyc]) => {
      setOverview(ov);
      setInstruments(inst);
      setPositions(pos);
      setKycStatus(kyc.status);
      setLoading(false);
      const now = new Date();
      setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
    });
  }, []);

  // Real-time polling every 15 seconds for customer dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      Promise.all([
        dashboardService.getOverview(),
        marketsService.getInstruments(),
        portfolioService.getPositions(),
      ]).then(([ov, inst, pos]) => {
        setOverview(ov);
        setInstruments(inst);
        setPositions(pos);
        setSyncing(false);
        const now = new Date();
        setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute live P&L from real-time BTC/ETH prices
  const liveOverview = overview ? (() => {
    const btcLive = quotes['BTC/USDC'];
    const ethLive = quotes['ETH/USDC'];
    if (!btcLive && !ethLive) return overview;

    const btcPrice = btcLive?.price ?? overview.btcPrice;
    const btcChangePct = btcLive?.changePct24h ?? overview.btcChangePct;

    // Estimate live portfolio value based on BTC price movement
    const btcPriceRatio = overview.btcPrice > 0 ? btcPrice / overview.btcPrice : 1;
    const livePortfolioValue = Math.round(overview.portfolioValue * (0.6 + 0.4 * btcPriceRatio) * 100) / 100;
    const liveChange24h = livePortfolioValue - (overview.portfolioValue - overview.portfolioChange24h);
    const liveChangePct24h = overview.portfolioValue > 0 ? (liveChange24h / (overview.portfolioValue - overview.portfolioChange24h)) * 100 : overview.portfolioChangePct24h;

    // Live P&L
    const livePnl24h = Math.round(liveChange24h * 0.85 * 100) / 100;
    const livePnlPct24h = overview.portfolioValue > 0 ? (livePnl24h / overview.portfolioValue) * 100 : overview.pnlPct24h;

    return {
      ...overview,
      btcPrice,
      btcChangePct,
      portfolioValue: livePortfolioValue,
      portfolioChange24h: liveChange24h,
      portfolioChangePct24h: liveChangePct24h,
      pnl24h: livePnl24h,
      pnlPct24h: livePnlPct24h,
    };
  })() : overview;

  const portfolioHistory = positions.length > 0 ? buildPortfolioHistory(positions) : overview?.portfolioHistory ?? [];

  const visibleNotifs = notifications.filter(n => !n.read);

  const dismissNotif = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      // Persist so it never shows again
      if (typeof localStorage !== 'undefined') {
        const readIds = next.filter(n => n.read).map(n => n.id);
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(readIds));
      }
      return next;
    });
  };

  const dismissAll = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      if (typeof localStorage !== 'undefined') {
        const readIds = next.map(n => n.id);
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(readIds));
      }
      return next;
    });
  };

  if (loading) return <DashboardSkeleton />;

  const isLive = Object.keys(quotes).length > 0;

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Welcome back, Alex · Last updated {lastUpdated || 'Aug 27, 14:45'} UTC{syncing ? ' · syncing…' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isLive ? 'var(--positive)' : '#f59e0b' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{isLive ? 'Live P&L' : 'Connecting…'}</span>
        </div>
      </div>

      {/* KYC mandatory notice — shown when verification is incomplete */}
      {kycRequired && kycStatus !== 'verified' && kycStatus !== 'submitted' && kycStatus !== 'under_review' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded border" style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={13} className="shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Identity verification required</span>
            <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>Complete your verification to unlock all account functionality.</span>
          </div>
          <Link
            href="/settings?tab=kyc"
            className="text-xs px-3 py-1.5 rounded font-semibold shrink-0 transition-all hover:opacity-90"
            style={{ backgroundColor: '#f59e0b', color: '#000' }}
          >
            Complete Verification
          </Link>
        </div>
      )}

      {/* Premium Notification Stack */}
      {visibleNotifs.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          {/* Stack header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell size={13} style={{ color: 'var(--primary)' }} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '7px' }}>
                  {visibleNotifs.length}
                </span>
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {visibleNotifs.length} new {visibleNotifs.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
            <button
              onClick={dismissAll}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <CheckCircle2 size={11} />
              Dismiss all
            </button>
          </div>

          {/* Notification items */}
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {visibleNotifs.map((n) => {
              const meta = NOTIF_META[n.type] || NOTIF_META.system;
              const NIcon = meta.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  {n.priority === 'high' && (
                    <div className="w-0.5 h-8 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                  )}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.bg, border: `1px solid ${meta.accent}` }}
                  >
                    <NIcon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                      {n.priority === 'high' && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: meta.bg, color: meta.color, fontSize: '9px' }}>
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs hidden sm:block" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{n.time}</span>
                    <button
                      onClick={() => dismissNotif(n.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI bento grid — uses live P&L data */}
      {liveOverview && <KpiGrid overview={liveOverview} />}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <PortfolioChart history={portfolioHistory} positions={positions} liveQuotes={quotes} />
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