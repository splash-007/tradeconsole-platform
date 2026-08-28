'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Megaphone, BarChart, TrendingUp, DollarSign } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps { label: string; value: string | number; sub?: string; color?: string; icon: React.ElementType; }
function KpiCard({ label, value, sub, color = 'var(--primary)', icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
    </div>
  );
}

const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'Q3 Crypto Launch', channel: 'Social', leads: 420, cost: '$8,400', cpl: '$20', status: 'Active', roi: '+340%' },
  { id: 'c2', name: 'Summer FTD Push', channel: 'Email', leads: 280, cost: '$4,200', cpl: '$15', status: 'Active', roi: '+280%' },
  { id: 'c3', name: 'New Market Entry', channel: 'PPC', leads: 120, cost: '$6,000', cpl: '$50', status: 'Paused', roi: '+120%' },
  { id: 'c4', name: 'Retention Drive', channel: 'SMS', leads: 83, cost: '$1,660', cpl: '$20', status: 'Active', roi: '+410%' },
];

const STATUS_COLORS: Record<string, string> = { Active: '#22c55e', Paused: '#f59e0b', Ended: '#6b7280' };

export default function MarketerManagerWorkspace() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'traffic' | 'team'>('campaigns');

  return (
    <StaffShell
      role="marketer_manager"
      staffName="Diana Reyes"
      staffEmail="diana.reyes@cryptovault.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Marketer Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Campaign management, traffic analytics, UTM tracking, and team oversight</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Active Campaigns" value={3} sub="1 paused" icon={Megaphone} />
          <KpiCard label="Total Leads MTD" value="903" sub="+127 vs last month" icon={TrendingUp} color="#22c55e" />
          <KpiCard label="Total Ad Spend" value="$20.3K" sub="Budget: $25K" icon={DollarSign} color="#f59e0b" />
          <KpiCard label="Avg CPL" value="$22.5" sub="-$3.2 vs last month" icon={BarChart} color="#3b82f6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['campaigns', 'traffic', 'team'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded text-xs font-medium capitalize transition-all"
              style={{
                backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--muted-foreground)',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'campaigns' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Campaign Performance</h2>
              <button className="text-xs px-3 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                + New Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Campaign', 'Channel', 'Leads', 'Cost', 'CPL', 'ROI', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CAMPAIGNS.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.channel}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{c.leads}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{c.cost}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{c.cpl}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: '#22c55e' }}>{c.roi}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Traffic by Source</h2>
              <div className="space-y-2">
                {[
                  { source: 'Organic Search', visits: 4820, pct: 48, color: '#22c55e' },
                  { source: 'Paid Social', visits: 2410, pct: 24, color: 'var(--primary)' },
                  { source: 'Email', visits: 1500, pct: 15, color: '#3b82f6' },
                  { source: 'Referral', visits: 800, pct: 8, color: '#8b5cf6' },
                  { source: 'Direct', visits: 470, pct: 5, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="text-xs w-28 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{s.source}</span>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full rounded flex items-center px-2" style={{ width: `${s.pct}%`, backgroundColor: s.color }}>
                        <span className="text-xs font-bold text-white">{s.pct}%</span>
                      </div>
                    </div>
                    <span className="text-xs w-10 text-right shrink-0" style={{ color: 'var(--muted-foreground)' }}>{(s.visits / 1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>UTM Performance</h2>
              <div className="space-y-2">
                {[
                  { utm: 'summer_ftd_2024', clicks: 1240, conversions: 89, ctr: '7.2%' },
                  { utm: 'q3_launch_social', clicks: 980, conversions: 67, ctr: '6.8%' },
                  { utm: 'retention_sms', clicks: 420, conversions: 38, ctr: '9.0%' },
                  { utm: 'ppc_new_market', clicks: 310, conversions: 18, ctr: '5.8%' },
                ].map((u, i) => (
                  <div key={i} className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium" style={{ color: 'var(--primary)' }}>{u.utm}</span>
                      <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{u.ctr} CTR</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{u.clicks} clicks · {u.conversions} conversions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Marketing Team</h2>
            <div className="space-y-2">
              {[
                { name: 'Kevin Park', role: 'New Affiliate Manager', campaigns: 3, leads: 284, status: 'Online' },
                { name: 'Anna Müller', role: 'Campaign Specialist', campaigns: 2, leads: 156, status: 'Online' },
                { name: 'Raj Patel', role: 'Content Marketer', campaigns: 1, leads: 98, status: 'Away' },
                { name: 'Tom Bradley', role: 'PPC Specialist', campaigns: 2, leads: 365, status: 'Online' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{m.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.role} · {m.campaigns} campaigns · {m.leads} leads</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[m.status] }} />
                    <span className="text-xs" style={{ color: STATUS_COLORS[m.status] }}>{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
