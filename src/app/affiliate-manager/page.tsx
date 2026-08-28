'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, TrendingUp, Megaphone, BarChart2, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

const MOCK_AFFILIATES = [
  { id: 'af1', name: 'TechTraffic Ltd', manager: 'John Smith', leads: 284, ftds: 42, commission: '$8,400', status: 'Active', trend: '+12%' },
  { id: 'af2', name: 'DigitalLeads Pro', manager: 'Anna Müller', leads: 156, ftds: 28, commission: '$5,600', status: 'Active', trend: '+5%' },
  { id: 'af3', name: 'CryptoMedia Hub', manager: 'Raj Patel', leads: 98, ftds: 15, commission: '$3,000', status: 'Active', trend: '-2%' },
  { id: 'af4', name: 'FX Signals Group', manager: 'Elena Kozlov', leads: 45, ftds: 6, commission: '$1,200', status: 'Paused', trend: '-8%' },
  { id: 'af5', name: 'Alpha Markets', manager: 'Tom Bradley', leads: 320, ftds: 58, commission: '$11,600', status: 'Active', trend: '+18%' },
];

export default function AffiliateManagerWorkspace() {
  const [activeTab, setActiveTab] = useState<'affiliates' | 'performance' | 'campaigns'>('affiliates');

  return (
    <StaffShell
      role="affiliate_manager"
      staffName="Jessica Liu"
      staffEmail="jessica.liu@cryptovault.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Affiliate Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage affiliate network, performance, campaigns, and commissions</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Active Affiliates" value={18} sub="+3 this month" positive icon={Users} />
          <KpiCard label="Total Leads MTD" value="903" sub="+127 vs last month" positive icon={TrendingUp} color="#22c55e" />
          <KpiCard label="FTDs via Affiliates" value={149} sub="+22 this month" positive icon={DollarSign} color="#f59e0b" />
          <KpiCard label="Commissions Paid" value="$29.8K" sub="+$4.2K vs last month" positive icon={BarChart2} color="#3b82f6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['affiliates', 'performance', 'campaigns'] as const).map(tab => (
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

        {activeTab === 'affiliates' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Affiliate Network</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>18 active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Affiliate', 'Contact', 'Leads', 'FTDs', 'Commission', 'Trend', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AFFILIATES.map(a => (
                    <tr key={a.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{a.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.manager}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{a.leads}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{a.ftds}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: '#22c55e' }}>{a.commission}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium" style={{ color: a.trend.startsWith('+') ? '#22c55e' : '#ef4444' }}>{a.trend}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: a.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: a.status === 'Active' ? '#22c55e' : 'var(--muted-foreground)' }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Top Performers</h2>
              <div className="space-y-2">
                {MOCK_AFFILIATES.sort((a, b) => b.ftds - a.ftds).slice(0, 4).map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-xs font-bold w-5 shrink-0" style={{ color: i === 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{a.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.leads} leads · {a.ftds} FTDs</p>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: '#22c55e' }}>{a.commission}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Monthly Targets</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Leads', value: 903, target: 1000, pct: 90 },
                  { label: 'FTD Conversions', value: 149, target: 180, pct: 83 },
                  { label: 'Commission Budget', value: '$29.8K', target: '$35K', pct: 85, raw: 85 },
                  { label: 'New Affiliates', value: 3, target: 5, pct: 60 },
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
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Campaign Overview</h2>
            <div className="space-y-3">
              {[
                { name: 'Q3 Crypto Launch', affiliates: 8, leads: 420, ftds: 68, budget: '$12,000', status: 'Active' },
                { name: 'Summer FTD Push', affiliates: 5, leads: 280, ftds: 45, budget: '$8,000', status: 'Active' },
                { name: 'New Market Entry', affiliates: 3, leads: 120, ftds: 18, budget: '$4,000', status: 'Paused' },
                { name: 'Retention Campaign', affiliates: 4, leads: 83, ftds: 18, budget: '$5,800', status: 'Active' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
                  <Megaphone size={14} style={{ color: 'var(--primary)' }} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.affiliates} affiliates · {c.leads} leads · {c.ftds} FTDs</p>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: 'var(--primary)' }}>{c.budget}</span>
                  <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: c.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: c.status === 'Active' ? '#22c55e' : 'var(--muted-foreground)' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
