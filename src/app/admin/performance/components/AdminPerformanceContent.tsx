'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Target, Award, RefreshCw, ChevronUp, ChevronDown, Phone, DollarSign, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import Icon from '@/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  department: string;
  customersAssigned: number;
  callsMade: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  tasksCompleted: number;
  avgResponseTime: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface BrokerPerformance {
  id: string;
  name: string;
  type: string;
  leadsAssigned: number;
  ftdCount: number;
  ftdRate: number;
  retentionRate: number;
  totalRevenue: number;
  avgDealSize: number;
  callsToday: number;
  score: number;
}

interface TeamKPI {
  team: string;
  members: number;
  conversions: number;
  revenue: number;
  avgScore: number;
  target: number;
  achieved: number;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function generateStaffPerformance(): StaffPerformance[] {
  return [
    { id: 's1', name: 'James Park', role: 'Broker', department: 'Sales', customersAssigned: 42, callsMade: 87, conversions: 18, conversionRate: 42.8, revenue: 124500, tasksCompleted: 34, avgResponseTime: '4m', score: 94, trend: 'up' },
    { id: 's2', name: 'Emma Wilson', role: 'Broker', department: 'Sales', customersAssigned: 38, callsMade: 72, conversions: 14, conversionRate: 36.8, revenue: 98200, tasksCompleted: 29, avgResponseTime: '6m', score: 87, trend: 'up' },
    { id: 's3', name: 'Carlos Mendez', role: 'FTD Broker', department: 'Conversion', customersAssigned: 55, callsMade: 103, conversions: 22, conversionRate: 40.0, revenue: 145000, tasksCompleted: 41, avgResponseTime: '3m', score: 96, trend: 'up' },
    { id: 's4', name: 'Maria Santos', role: 'Retention Broker', department: 'Retention', customersAssigned: 61, callsMade: 94, conversions: 19, conversionRate: 31.1, revenue: 87400, tasksCompleted: 38, avgResponseTime: '5m', score: 82, trend: 'stable' },
    { id: 's5', name: 'Yuki Tanaka', role: 'Compliance Broker', department: 'Compliance', customersAssigned: 28, callsMade: 45, conversions: 0, conversionRate: 0, revenue: 0, tasksCompleted: 52, avgResponseTime: '8m', score: 91, trend: 'up' },
    { id: 's6', name: 'Anna Kowalski', role: 'Operator', department: 'Operations', customersAssigned: 33, callsMade: 68, conversions: 9, conversionRate: 27.2, revenue: 42000, tasksCompleted: 47, avgResponseTime: '2m', score: 88, trend: 'down' },
    { id: 's7', name: 'Liam Johnson', role: 'Team Leader', department: 'Sales', customersAssigned: 20, callsMade: 38, conversions: 11, conversionRate: 55.0, revenue: 76000, tasksCompleted: 22, avgResponseTime: '7m', score: 90, trend: 'up' },
    { id: 's8', name: 'Marco Rossi', role: 'Affiliate', department: 'Marketing', customersAssigned: 0, callsMade: 12, conversions: 31, conversionRate: 0, revenue: 58000, tasksCompleted: 18, avgResponseTime: 'N/A', score: 85, trend: 'stable' },
  ];
}

function generateBrokerPerformance(): BrokerPerformance[] {
  return [
    { id: 'b1', name: 'James Park', type: 'Broker', leadsAssigned: 42, ftdCount: 18, ftdRate: 42.8, retentionRate: 78, totalRevenue: 124500, avgDealSize: 6916, callsToday: 12, score: 94 },
    { id: 'b2', name: 'Emma Wilson', type: 'Broker', leadsAssigned: 38, ftdCount: 14, ftdRate: 36.8, retentionRate: 71, totalRevenue: 98200, avgDealSize: 7014, callsToday: 9, score: 87 },
    { id: 'b3', name: 'Carlos Mendez', type: 'FTD Broker', leadsAssigned: 55, ftdCount: 22, ftdRate: 40.0, retentionRate: 0, totalRevenue: 145000, avgDealSize: 6590, callsToday: 15, score: 96 },
    { id: 'b4', name: 'Maria Santos', type: 'Retention Broker', leadsAssigned: 61, ftdCount: 0, ftdRate: 0, retentionRate: 68, totalRevenue: 87400, avgDealSize: 4600, callsToday: 11, score: 82 },
    { id: 'b5', name: 'Liam Johnson', type: 'Team Leader', leadsAssigned: 20, ftdCount: 11, ftdRate: 55.0, retentionRate: 82, totalRevenue: 76000, avgDealSize: 6909, callsToday: 6, score: 90 },
  ];
}

function generateTeamKPIs(): TeamKPI[] {
  return [
    { team: 'Sales (Brokers)', members: 8, conversions: 64, revenue: 428000, avgScore: 89, target: 500000, achieved: 85.6 },
    { team: 'Conversion (FTD)', members: 5, conversions: 42, revenue: 285000, avgScore: 91, target: 300000, achieved: 95.0 },
    { team: 'Retention', members: 6, conversions: 38, revenue: 198000, avgScore: 84, target: 220000, achieved: 90.0 },
    { team: 'Compliance', members: 4, conversions: 0, revenue: 0, avgScore: 92, target: 0, achieved: 100 },
    { team: 'Marketing / Affiliates', members: 3, conversions: 87, revenue: 174000, avgScore: 86, target: 200000, achieved: 87.0 },
  ];
}

function generateConversionFunnel(): ConversionFunnel[] {
  return [
    { stage: 'Registrations', count: 1240, rate: 100, color: '#3b82f6' },
    { stage: 'Contacted', count: 892, rate: 71.9, color: '#8b5cf6' },
    { stage: 'Qualified', count: 534, rate: 43.0, color: '#F5C400' },
    { stage: 'First Deposit', count: 218, rate: 17.6, color: '#22c55e' },
    { stage: 'Active Trader', count: 142, rate: 11.4, color: '#f59e0b' },
  ];
}

function generateWeeklyRevenue() {
  return [
    { day: 'Mon', revenue: 42000, conversions: 12 },
    { day: 'Tue', revenue: 58000, conversions: 18 },
    { day: 'Wed', revenue: 51000, conversions: 15 },
    { day: 'Thu', revenue: 67000, conversions: 21 },
    { day: 'Fri', revenue: 74000, conversions: 24 },
    { day: 'Sat', revenue: 38000, conversions: 10 },
    { day: 'Sun', revenue: 29000, conversions: 8 },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#F5C400' : '#ef4444';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}20`, color }}>
      <Star size={10} />
      {score}
    </span>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ChevronUp size={14} style={{ color: '#22c55e' }} />;
  if (trend === 'down') return <ChevronDown size={14} style={{ color: '#ef4444' }} />;
  return <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>—</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPerformanceContent() {
  const [staffData, setStaffData] = useState<StaffPerformance[]>([]);
  const [brokerData, setBrokerData] = useState<BrokerPerformance[]>([]);
  const [teamKPIs, setTeamKPIs] = useState<TeamKPI[]>([]);
  const [funnel, setFunnel] = useState<ConversionFunnel[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; revenue: number; conversions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'brokers' | 'teams' | 'funnel'>('staff');
  const [sortField, setSortField] = useState<keyof StaffPerformance>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    // BACKEND INTEGRATION: GET /api/v1/admin/performance
    setTimeout(() => {
      setStaffData(generateStaffPerformance());
      setBrokerData(generateBrokerPerformance());
      setTeamKPIs(generateTeamKPIs());
      setFunnel(generateConversionFunnel());
      setWeeklyRevenue(generateWeeklyRevenue());
      const now = new Date();
      setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      setLoading(false);
      setRefreshing(false);
    }, 400);
  }, []);

  // Initial load
  useEffect(() => { loadData(); }, [loadData]);

  // Real-time polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSort = (field: keyof StaffPerformance) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortedStaff = [...staffData].sort((a, b) => {
    const av = a[sortField] as number | string;
    const bv = b[sortField] as number | string;
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalRevenue = staffData.reduce((s, x) => s + x.revenue, 0);
  const totalConversions = staffData.reduce((s, x) => s + x.conversions, 0);
  const avgScore = staffData.length ? Math.round(staffData.reduce((s, x) => s + x.score, 0) / staffData.length) : 0;
  const totalCalls = staffData.reduce((s, x) => s + x.callsMade, 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="h-80 rounded-xl" style={{ backgroundColor: 'var(--card)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Performance Analytics</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Staff · Broker · Conversion · Team KPIs
            {lastUpdated && <span className="ml-2">· Updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--positive)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Live · 30s refresh</span>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-white/5 disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue (MTD)" value={`$${(totalRevenue / 1000).toFixed(0)}K`} sub="Month to date" icon={DollarSign} color="#22c55e" />
        <KpiCard label="Total Conversions" value={totalConversions} sub="All staff combined" icon={Target} color="#F5C400" />
        <KpiCard label="Avg Staff Score" value={`${avgScore}/100`} sub="Performance index" icon={Award} color="#8b5cf6" />
        <KpiCard label="Total Calls Made" value={totalCalls} sub="This period" icon={Phone} color="#3b82f6" />
      </div>

      {/* Weekly Revenue Chart */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Weekly Revenue & Conversions</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>This Week</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyRevenue} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Conversions']}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#F5C400" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar yAxisId="right" dataKey="conversions" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--card)' }}>
        {(['staff', 'brokers', 'teams', 'funnel'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--muted-foreground)',
            }}
          >
            {tab === 'funnel' ? 'Conversion Funnel' : tab === 'teams' ? 'Team KPIs' : tab === 'brokers' ? 'Broker Performance' : 'Staff Performance'}
          </button>
        ))}
      </div>

      {/* Staff Performance Table */}
      {activeTab === 'staff' && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Staff Performance Metrics</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Click column headers to sort</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: 'Staff Member', field: 'name' as keyof StaffPerformance },
                    { label: 'Role', field: 'role' as keyof StaffPerformance },
                    { label: 'Customers', field: 'customersAssigned' as keyof StaffPerformance },
                    { label: 'Calls', field: 'callsMade' as keyof StaffPerformance },
                    { label: 'Conversions', field: 'conversions' as keyof StaffPerformance },
                    { label: 'Conv. Rate', field: 'conversionRate' as keyof StaffPerformance },
                    { label: 'Revenue', field: 'revenue' as keyof StaffPerformance },
                    { label: 'Tasks Done', field: 'tasksCompleted' as keyof StaffPerformance },
                    { label: 'Resp. Time', field: 'avgResponseTime' as keyof StaffPerformance },
                    { label: 'Score', field: 'score' as keyof StaffPerformance },
                    { label: 'Trend', field: 'trend' as keyof StaffPerformance },
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:opacity-80 whitespace-nowrap"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.field && (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStaff.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < sortedStaff.length - 1 ? '1px solid var(--border)' : 'none' }}
                    className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>{s.role}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{s.customersAssigned}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{s.callsMade}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{s.conversions}</td>
                    <td className="px-4 py-3" style={{ color: s.conversionRate >= 40 ? '#22c55e' : s.conversionRate >= 25 ? '#F5C400' : 'var(--muted-foreground)' }}>
                      {s.conversionRate > 0 ? `${s.conversionRate.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--positive)' }}>
                      {s.revenue > 0 ? `$${s.revenue.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{s.tasksCompleted}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{s.avgResponseTime}</td>
                    <td className="px-4 py-3"><ScoreBadge score={s.score} /></td>
                    <td className="px-4 py-3"><TrendIcon trend={s.trend} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broker Performance Table */}
      {activeTab === 'brokers' && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Broker Performance</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>FTD rates, retention, revenue per broker</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Broker', 'Type', 'Leads', 'FTD Count', 'FTD Rate', 'Retention', 'Revenue', 'Avg Deal', 'Calls Today', 'Score'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brokerData.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < brokerData.length - 1 ? '1px solid var(--border)' : 'none' }}
                    className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{b.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{b.type}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{b.leadsAssigned}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#22c55e' }}>{b.ftdCount || '—'}</td>
                    <td className="px-4 py-3" style={{ color: b.ftdRate >= 40 ? '#22c55e' : b.ftdRate > 0 ? '#F5C400' : 'var(--muted-foreground)' }}>
                      {b.ftdRate > 0 ? `${b.ftdRate.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: b.retentionRate >= 70 ? '#22c55e' : b.retentionRate > 0 ? '#F5C400' : 'var(--muted-foreground)' }}>
                      {b.retentionRate > 0 ? `${b.retentionRate}%` : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--positive)' }}>${b.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>${b.avgDealSize.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{b.callsToday}</td>
                    <td className="px-4 py-3"><ScoreBadge score={b.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team KPIs */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamKPIs.map(team => (
              <div key={team.team} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{team.team}</h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{team.members} members</p>
                  </div>
                  <ScoreBadge score={team.avgScore} />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>Conversions</span>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{team.conversions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>Revenue</span>
                    <span className="font-medium" style={{ color: 'var(--positive)' }}>{team.revenue > 0 ? `$${team.revenue.toLocaleString()}` : '—'}</span>
                  </div>
                  {team.target > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted-foreground)' }}>Target</span>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>${team.target.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {team.target > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--muted-foreground)' }}>Target Achievement</span>
                      <span className="font-medium" style={{ color: team.achieved >= 90 ? '#22c55e' : team.achieved >= 70 ? '#F5C400' : '#ef4444' }}>{team.achieved.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(team.achieved, 100)}%`,
                          backgroundColor: team.achieved >= 90 ? '#22c55e' : team.achieved >= 70 ? '#F5C400' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Team Revenue Bar Chart */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Team Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamKPIs.filter(t => t.revenue > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="team" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#F5C400" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {activeTab === 'funnel' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Conversion Funnel</h3>
            <div className="space-y-3">
              {funnel.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>{i + 1}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{stage.count.toLocaleString()}</span>
                      <span className="text-xs w-12 text-right" style={{ color: stage.color }}>{stage.rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stage.rate}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  {i < funnel.length - 1 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Drop-off: {(funnel[i].count - funnel[i + 1].count).toLocaleString()} ({(100 - (funnel[i + 1].count / funnel[i].count * 100)).toFixed(1)}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Funnel Pie */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Stage Distribution</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={funnel} dataKey="count" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, _: string, props: { payload?: { stage?: string } }) => [v.toLocaleString(), props.payload?.stage ?? '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {funnel.map(stage => (
                  <div key={stage.stage} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stage.stage}</span>
                    <span className="text-xs font-medium ml-auto pl-4" style={{ color: 'var(--foreground)' }}>{stage.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
