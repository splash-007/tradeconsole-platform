'use client';
import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { portfolioService, Position } from '@/services/portfolio.service';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import KpiGrid from './KpiGrid';
import PortfolioChart from './PortfolioChart';
import TopMovers from './TopMovers';
import RecentActivity from './RecentActivity';
import MarketSummary from './MarketSummary';
import { DollarSign, Shield, ArrowUpFromLine, X, TrendingUp, Bell, Zap, CheckCircle2, AlertTriangle, Gift, Users } from 'lucide-react';
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

// Symbols supported by Twelve Data / Tiingo
const REAL_DATA_SYMBOLS = [
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD',
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD',
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN',
  'SPY', 'QQQ',
];

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

  // Real market data from internal API routes (Twelve Data / Tiingo)
  const { quotes: realQuotes, loading: realLoading } = useMarketQuotes(REAL_DATA_SYMBOLS);

  // Legacy Binance WS quotes (kept for candle data; price overridden by real data when available)
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

  // Compute live P&L — prefer real data over Binance WS
  const liveOverview = overview ? (() => {
    const btcReal = realQuotes['BTC/USD'];
    const btcLive = quotes['BTC/USDC'];

    const btcPrice = (btcReal?.available && btcReal.quote?.price != null)
      ? btcReal.quote.price
      : (btcLive?.price ?? overview.btcPrice);

    const btcChangePct = (btcReal?.available && btcReal.quote?.changePercent != null)
      ? btcReal.quote.changePercent
      : (btcLive?.changePct24h ?? overview.btcChangePct);

    // Only update BTC price display — do NOT recalculate mock portfolio P&L from live prices.
    // Customer holdings, quantities, and cost basis are mock development data.
    // Portfolio P&L will be live only when real backend positions are connected.
    return {
      ...overview,
      btcPrice,
      btcChangePct,
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

  const isLive = Object.values(realQuotes).some(q => q.available) || Object.keys(quotes).length > 0;

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
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isLive ? 'var(--positive)' : realLoading ? '#f59e0b' : '#6b7280' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {isLive ? 'Live' : realLoading ? 'Connecting…' : 'Market data unavailable'}
          </span>
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

      {/* Notification Stack */}
      {visibleNotifs.length > 0 && (
        <div className="rounded border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {visibleNotifs.length} new {visibleNotifs.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
            <button
              onClick={dismissAll}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-muted"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <CheckCircle2 size={11} />
              Dismiss all
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {visibleNotifs.map((n) => {
              const meta = NOTIF_META[n.type] || NOTIF_META.system;
              const NIcon = meta.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-muted/40"
                >
                  {n.priority === 'high' && (
                    <div className="w-0.5 h-7 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                  )}
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.bg, border: `1px solid ${meta.accent}` }}
                  >
                    <NIcon size={13} style={{ color: meta.color }} />
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
                      className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
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

      {/* Available Programs — compact discovery section */}
      <div className="rounded border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Gift size={13} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Available Programs</span>
          </div>
          <Link href="/programs" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
          {[
            { icon: DollarSign, label: 'Deposit Bonus', desc: 'Promotional credit on qualifying deposits', color: 'var(--primary)', href: '/programs' },
            { icon: Users, label: 'Referral Program', desc: 'Invite clients and earn rewards', color: '#22c55e', href: '/programs' },
            { icon: TrendingUp, label: 'Crypto Lending', desc: 'Allocate assets to lending programs', color: '#3b82f6', href: '/programs' },
            { icon: Zap, label: 'Dividend Program', desc: 'Eligible account benefit programs', color: 'var(--primary)', href: '/settings?tab=dividend' },
          ].map((prog, i) => (
            <Link
              key={i}
              href={prog.href}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
              style={{ textDecoration: 'none', borderColor: 'var(--border)' }}
            >
              <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${prog.color}14` }}>
                <prog.icon size={13} style={{ color: prog.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{prog.label}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{prog.desc}</p>
              </div>
            </Link>
          ))}
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