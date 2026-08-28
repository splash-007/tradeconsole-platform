'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, TrendingUp, List, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps { label: string; value: string | number; sub?: string; color?: string; positive?: boolean; icon: React.ElementType; }
function KpiCard({ label, value, sub, color = 'var(--primary)', positive, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && (
          <p className="text-xs mt-0.5 flex items-center gap-0.5" style={{ color: positive === undefined ? 'var(--muted-foreground)' : positive ? '#22c55e' : '#ef4444' }}>
            {positive !== undefined && (positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />)}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const MOCK_TEAM = [
  { id: 'r1', name: 'Maria Santos', customers: 22, retained: 18, rate: '82%', revenue: '$420,000', status: 'Online' },
  { id: 'r2', name: 'David Kim', customers: 18, retained: 13, rate: '72%', revenue: '$310,000', status: 'Online' },
  { id: 'r3', name: 'Lisa Wang', customers: 15, retained: 12, rate: '80%', revenue: '$280,000', status: 'Away' },
  { id: 'r4', name: 'Omar Hassan', customers: 20, retained: 14, rate: '70%', revenue: '$340,000', status: 'Online' },
];

const MOCK_QUEUE = [
  { id: 'q1', name: 'Marcus Whitfield', broker: 'Maria Santos', lastDeposit: '32 days ago', risk: 'High', balance: '$8,420' },
  { id: 'q2', name: 'David Kim', broker: 'David Kim', lastDeposit: '45 days ago', risk: 'Critical', balance: '$9,100' },
  { id: 'q3', name: 'Aisha Al-Rashidi', broker: 'Lisa Wang', lastDeposit: '21 days ago', risk: 'Medium', balance: '$52,000' },
  { id: 'q4', name: 'Tom Bradley', broker: 'Omar Hassan', lastDeposit: '28 days ago', risk: 'High', balance: '$14,200' },
];

const RISK_COLORS: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444', Critical: '#dc2626' };

export default function RetentionManagerWorkspace() {
  const [activeTab, setActiveTab] = useState<'team' | 'queue' | 'reports'>('team');

  return (
    <StaffShell
      role="retention_manager"
      staffName="Diana Reyes"
      staffEmail="diana.reyes@cryptovault.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Retention Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage retention team, at-risk queue, and client retention strategy</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Retention Team" value={4} sub="3 online" positive icon={Users} />
          <KpiCard label="Team Retention Rate" value="76%" sub="+3% this month" positive icon={TrendingUp} color="#22c55e" />
          <KpiCard label="At-Risk Queue" value={8} sub="2 critical" icon={List} color="#ef4444" />
          <KpiCard label="Team Revenue MTD" value="$1.35M" sub="+12% vs last month" positive icon={DollarSign} color="#f59e0b" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['team', 'queue', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded text-xs font-medium capitalize transition-all"
              style={{
                backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--muted-foreground)',
              }}
            >
              {tab === 'queue' ? 'At-Risk Queue' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'team' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Retention Team Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Broker', 'Customers', 'Retained', 'Rate', 'Revenue', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TEAM.map(r => (
                    <tr key={r.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{r.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{r.customers}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{r.retained}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: '#22c55e' }}>{r.rate}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{r.revenue}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.status === 'Online' ? '#22c55e' : '#f59e0b' }} />
                          <span style={{ color: r.status === 'Online' ? '#22c55e' : '#f59e0b' }}>{r.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>At-Risk Customer Queue</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>8 at risk</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Assigned Broker', 'Last Deposit', 'Risk', 'Balance', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_QUEUE.map(q => (
                    <tr key={q.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{q.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{q.broker}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{q.lastDeposit}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium" style={{ color: RISK_COLORS[q.risk] }}>{q.risk}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{q.balance}</td>
                      <td className="px-4 py-2.5">
                        <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          Escalate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Monthly Targets</h2>
              <div className="space-y-3">
                {[
                  { label: 'Retention Rate', value: '76%', target: '80%', pct: 95 },
                  { label: 'Re-deposits', value: 28, target: 35, pct: 80 },
                  { label: 'Churn Prevented', value: 12, target: 15, pct: 80 },
                  { label: 'Revenue Retained', value: '$1.35M', target: '$1.5M', pct: 90, raw: 90 },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.label}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{m.value} / {m.target}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(m.pct, 100)}%`, backgroundColor: m.pct >= 100 ? '#22c55e' : 'var(--primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Churn Risk Distribution</h2>
              <div className="space-y-2">
                {[
                  { label: 'Low Risk', count: 48, pct: 64, color: '#22c55e' },
                  { label: 'Medium Risk', count: 16, pct: 21, color: '#f59e0b' },
                  { label: 'High Risk', count: 8, pct: 11, color: '#ef4444' },
                  { label: 'Critical', count: 3, pct: 4, color: '#dc2626' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-xs w-20 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{r.label}</span>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full rounded flex items-center px-2" style={{ width: `${r.pct}%`, backgroundColor: r.color }}>
                        <span className="text-xs font-bold text-white">{r.count}</span>
                      </div>
                    </div>
                    <span className="text-xs w-6 text-right shrink-0" style={{ color: 'var(--muted-foreground)' }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
