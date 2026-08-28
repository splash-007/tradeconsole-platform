'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, DollarSign, BarChart2, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface MetricCardProps { label: string; value: string; change: string; positive: boolean; icon: React.ElementType; }
function MetricCard({ label, value, change, positive, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.1)' }}>
          <Icon size={15} style={{ color: 'var(--primary)' }} />
        </div>
        <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: positive ? '#22c55e' : '#ef4444' }}>
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{change}
        </span>
      </div>
      <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
    </div>
  );
}

const MOCK_TEAMS = [
  { name: 'Broker Team', manager: 'Sarah Chen', brokers: 8, customers: 142, revenue: '$284,000', conversion: '38%', trend: '+5%' },
  { name: 'FTD Team', manager: 'James Park', brokers: 5, customers: 89, revenue: '$178,000', conversion: '42%', trend: '+12%' },
  { name: 'Retention Team', manager: 'Maria Santos', brokers: 6, customers: 210, revenue: '$420,000', conversion: '28%', trend: '-2%' },
  { name: 'Compliance Team', manager: 'Lisa Wang', brokers: 4, customers: 67, revenue: '$0', conversion: 'N/A', trend: '—' },
];

export default function VPSalesWorkspace() {
  return (
    <StaffShell
      role="vp_sales"
      staffName="Robert Chen"
      staffEmail="robert.chen@cryptovault.app"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>VP Sales Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Sales overview, team performance, and revenue metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Revenue MTD" value="$882,000" change="+18%" positive icon={DollarSign} />
          <MetricCard label="FTD Conversions" value="148" change="+8%" positive icon={Target} />
          <MetricCard label="Active Brokers" value="23" change="+2" positive icon={Users} />
          <MetricCard label="Avg Conversion Rate" value="36%" change="-1%" positive={false} icon={BarChart2} />
        </div>

        {/* Team Performance Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Team Performance</h2>
            <button className="text-xs px-3 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
              Full Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Team', 'Manager', 'Brokers', 'Customers', 'Revenue', 'Conversion', 'Trend'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAMS.map(t => (
                  <tr key={t.name} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground)' }}>{t.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{t.manager}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{t.brokers}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{t.customers}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--primary)' }}>{t.revenue}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{t.conversion}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: t.trend.startsWith('+') ? '#22c55e' : t.trend.startsWith('-') ? '#ef4444' : 'var(--muted-foreground)' }}>
                        {t.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Funnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Customer Funnel</h2>
            <div className="space-y-2">
              {[
                { stage: 'Registrations', count: 941, pct: 100, color: '#3b82f6' },
                { stage: 'Qualified', count: 620, pct: 66, color: '#f59e0b' },
                { stage: 'First Contact', count: 480, pct: 51, color: 'var(--primary)' },
                { stage: 'FTD', count: 148, pct: 16, color: '#22c55e' },
                { stage: 'Active Traders', count: 89, pct: 9, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-xs w-28 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{s.stage}</span>
                  <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded flex items-center px-2" style={{ width: `${s.pct}%`, backgroundColor: s.color }}>
                      <span className="text-xs font-bold text-white">{s.count}</span>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--muted-foreground)' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Revenue by Team</h2>
            <div className="space-y-3">
              {[
                { team: 'Retention Team', revenue: '$420,000', pct: 48 },
                { team: 'Broker Team', revenue: '$284,000', pct: 32 },
                { team: 'FTD Team', revenue: '$178,000', pct: 20 },
              ].map(item => (
                <div key={item.team}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{item.team}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{item.revenue}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
