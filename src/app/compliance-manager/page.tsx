'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { ShieldCheck, Users, AlertTriangle, CheckCircle, Clock, FileText, Search, Download, RefreshCw, Eye, ChevronDown, TrendingUp, Flag } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps { label: string; value: string | number; sub?: string; color?: string; icon: React.ElementType; }
function KpiCard({ label, value, sub, color = 'var(--primary)', icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
    </div>
  );
}

const MOCK_QUEUE = [
  { id: 'kyc-001', customer: 'Thomas Bergmann', country: 'DE', type: 'Full KYC', submitted: '2 hrs ago', priority: 'High', status: 'pending', docs: 4, risk: 'medium' },
  { id: 'kyc-002', customer: 'Priya Sharma', country: 'IN', type: 'Address Proof', submitted: '4 hrs ago', priority: 'Medium', status: 'in_review', docs: 2, risk: 'low' },
  { id: 'kyc-003', customer: 'Carlos Mendez', country: 'MX', type: 'ID Verification', submitted: '1 day ago', priority: 'Low', status: 'pending', docs: 3, risk: 'low' },
  { id: 'kyc-004', customer: 'Yuki Tanaka', country: 'JP', type: 'Enhanced Due Diligence', submitted: '2 days ago', priority: 'High', status: 'escalated', docs: 5, risk: 'high' },
  { id: 'kyc-005', customer: 'Anna Kowalski', country: 'PL', type: 'Full KYC', submitted: '3 days ago', priority: 'Medium', status: 'pending', docs: 4, risk: 'low' },
  { id: 'kyc-006', customer: 'Omar Al-Farsi', country: 'AE', type: 'Enhanced Due Diligence', submitted: '4 days ago', priority: 'High', status: 'in_review', docs: 6, risk: 'high' },
];

const MOCK_AUDIT_LOG = [
  { id: 'al-001', action: 'KYC Approved', officer: 'Sarah Chen', customer: 'Alex Morgan', time: '09:14', date: 'Today', severity: 'info' },
  { id: 'al-002', action: 'Document Rejected', officer: 'James Park', customer: 'Dmitri Volkov', time: '08:55', date: 'Today', severity: 'warning' },
  { id: 'al-003', action: 'Risk Flag Raised', officer: 'System', customer: 'Yuki Tanaka', time: '07:30', date: 'Today', severity: 'critical' },
  { id: 'al-004', action: 'KYC Approved', officer: 'Sarah Chen', customer: 'Priya Sharma', time: '16:20', date: 'Yesterday', severity: 'info' },
  { id: 'al-005', action: 'Enhanced DD Initiated', officer: 'Lisa Wang', customer: 'Omar Al-Farsi', time: '14:05', date: 'Yesterday', severity: 'warning' },
  { id: 'al-006', action: 'Account Suspended', officer: 'Lisa Wang', customer: 'Unknown User', time: '11:00', date: 'Yesterday', severity: 'critical' },
];

const MOCK_RISK_FLAGS = [
  { id: 'rf-001', customer: 'Yuki Tanaka', flag: 'PEP Match', detail: 'Politically Exposed Person detected in screening', severity: 'critical', raised: '2 days ago' },
  { id: 'rf-002', customer: 'Omar Al-Farsi', flag: 'High-Risk Jurisdiction', detail: 'Customer registered from sanctioned region', severity: 'high', raised: '4 days ago' },
  { id: 'rf-003', customer: 'Marcus Whitfield', flag: 'Document Mismatch', detail: 'Name on ID does not match registration data', severity: 'medium', raised: '5 days ago' },
];

const MOCK_TEAM = [
  { name: 'Sarah Chen', cases: 12, approved: 8, rejected: 2, pending: 2, rate: '80%', avgTime: '1.8h' },
  { name: 'James Park', cases: 9, approved: 6, rejected: 1, pending: 2, rate: '86%', avgTime: '2.1h' },
  { name: 'Sofia Garcia', cases: 15, approved: 11, rejected: 3, pending: 1, rate: '79%', avgTime: '2.4h' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', in_review: '#3b82f6', escalated: '#ef4444', approved: '#22c55e', rejected: '#ef4444',
};

const SEVERITY_COLORS: Record<string, { color: string; bg: string }> = {
  info:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:      { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

type TabId = 'queue' | 'audit' | 'risk' | 'team';

export default function ComplianceManagerWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>('queue');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const filteredQueue = MOCK_QUEUE.filter(item => {
    const matchSearch = !search || item.customer.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const TABS: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'queue', label: 'Verification Queue', icon: ShieldCheck, count: MOCK_QUEUE.filter(q => q.status === 'pending').length },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'risk', label: 'Risk Flags', icon: Flag, count: MOCK_RISK_FLAGS.length },
    { id: 'team', label: 'Team Performance', icon: Users },
  ];

  return (
    <StaffShell role="compliance_manager" staffName="Lisa Wang" staffEmail="lisa.wang@cryptovault.app">
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Compliance Audit Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>KYC verification, audit trail, risk management and team oversight</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Pending Cases" value={11} sub="3 high priority" icon={Clock} color="#f59e0b" />
          <KpiCard label="Approved Today" value={8} sub="Avg 2.1 hrs review" icon={CheckCircle} color="#22c55e" />
          <KpiCard label="Risk Flags" value={3} sub="2 require action" icon={AlertTriangle} color="#ef4444" />
          <KpiCard label="Compliance Rate" value="94.2%" sub="Last 30 days" icon={TrendingUp} color="var(--primary)" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px"
                style={{
                  borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                <Icon size={13} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: activeTab === tab.id ? 'rgba(245,196,0,0.15)' : 'rgba(255,255,255,0.08)', color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Verification Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Search size={12} style={{ color: 'var(--muted-foreground)' }} />
                <input className="flex-1 text-xs bg-transparent outline-none" style={{ color: 'var(--foreground)' }} placeholder="Search customer or type..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs px-3 py-2 rounded-lg border appearance-none pr-7 outline-none cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="escalated">Escalated</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{filteredQueue.length} cases</span>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                {['Customer', 'Type', 'Submitted', 'Risk', 'Status', ''].map(h => (
                  <span key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
                ))}
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredQueue.map(item => {
                  const riskConf = SEVERITY_COLORS[item.risk] || SEVERITY_COLORS.low;
                  return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                          {item.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{item.customer}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.country} · {item.docs} docs</p>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--foreground)' }}>{item.type}</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.submitted}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium w-fit" style={{ backgroundColor: riskConf.bg, color: riskConf.color }}>
                        {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded capitalize w-fit" style={{ backgroundColor: `${STATUS_COLORS[item.status]}18`, color: STATUS_COLORS[item.status] }}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <div className="flex gap-1">
                        <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                          <Eye size={11} /> Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Audit Log */}
        {activeTab === 'audit' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Compliance Audit Trail</h2>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>All officer actions logged</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {MOCK_AUDIT_LOG.map(log => {
                const sevConf = SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.info;
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sevConf.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{log.action}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: sevConf.bg, color: sevConf.color }}>{log.severity}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        <span style={{ color: 'var(--foreground)' }}>{log.officer}</span> · Customer: {log.customer}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{log.time}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{log.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Risk Flags */}
        {activeTab === 'risk' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={13} style={{ color: '#ef4444' }} />
              <span style={{ color: 'var(--foreground)' }}>{MOCK_RISK_FLAGS.length} active risk flags require compliance review</span>
            </div>
            {MOCK_RISK_FLAGS.map(flag => {
              const sevConf = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.medium;
              return (
                <div key={flag.id} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sevConf.bg }}>
                        <Flag size={15} style={{ color: sevConf.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{flag.flag}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: sevConf.bg, color: sevConf.color }}>
                            {flag.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--foreground)' }}>Customer: <span style={{ color: 'var(--primary)' }}>{flag.customer}</span></p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{flag.detail}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>Raised {flag.raised}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                        Dismiss
                      </button>
                      <button className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                        Investigate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Team Performance */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {MOCK_TEAM.map(member => (
              <div key={member.name} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Compliance Officer</p>
                  </div>
                  <span className="ml-auto text-sm font-bold" style={{ color: '#22c55e' }}>{member.rate}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Approved', value: member.approved, color: '#22c55e' },
                    { label: 'Rejected', value: member.rejected, color: '#ef4444' },
                    { label: 'Pending', value: member.pending, color: '#f59e0b' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${stat.color}0d` }}>
                      <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Total Cases</span>
                  <span style={{ color: 'var(--foreground)' }}>{member.cases}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5">
                  <span style={{ color: 'var(--muted-foreground)' }}>Avg Review Time</span>
                  <span style={{ color: 'var(--foreground)' }}>{member.avgTime}</span>
                </div>
                {/* Approval rate bar */}
                <div className="mt-3">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: member.rate, backgroundColor: '#22c55e' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffShell>
  );
}
