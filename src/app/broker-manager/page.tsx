'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, UserCheck, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

const MOCK_BROKERS = [
  { id: 'b1', name: 'James Park', customers: 18, calls: 34, conversion: '38%', revenue: '$42,000', status: 'Online', score: 92 },
  { id: 'b2', name: 'Maria Santos', customers: 22, calls: 41, conversion: '31%', revenue: '$38,500', status: 'Online', score: 87 },
  { id: 'b3', name: 'Alex Rivera', customers: 15, calls: 28, conversion: '42%', revenue: '$51,000', status: 'Away', score: 95 },
  { id: 'b4', name: 'Priya Sharma', customers: 20, calls: 37, conversion: '28%', revenue: '$29,000', status: 'Offline', score: 74 },
  { id: 'b5', name: 'Tom Bradley', customers: 12, calls: 22, conversion: '45%', revenue: '$48,000', status: 'Online', score: 98 },
];

const STATUS_COLORS: Record<string, string> = { Online: '#22c55e', Away: '#f59e0b', Offline: '#6b7280' };

export default function BrokerManagerWorkspace() {
  return (
    <StaffShell
      role="broker_manager"
      staffName="Sarah Chen"
      staffEmail="sarah.chen@cryonfx.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Broker Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Oversee broker team performance, assignments, and revenue</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Broker Team" value={8} sub="6 online now" positive icon={Users} />
          <KpiCard label="Team Revenue MTD" value="$208.5K" sub="+14% vs last month" positive icon={DollarSign} color="#22c55e" />
          <KpiCard label="Avg Conversion" value="37%" sub="+2% this week" positive icon={TrendingUp} color="#f59e0b" />
          <KpiCard label="Pending Assignments" value={5} sub="3 high priority" icon={UserCheck} color="#3b82f6" />
        </div>

        {/* Broker Team Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Broker Team Performance</h2>
            <button className="text-xs px-3 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
              Full Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Broker', 'Customers', 'Calls', 'Conversion', 'Revenue', 'Score', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_BROKERS.map(b => (
                  <tr key={b.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{b.name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{b.customers}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{b.calls}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{b.conversion}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#22c55e' }}>{b.revenue}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${b.score}%`, backgroundColor: b.score >= 90 ? '#22c55e' : b.score >= 75 ? 'var(--primary)' : '#ef4444' }} />
                        </div>
                        <span className="text-xs font-bold w-6 shrink-0" style={{ color: 'var(--foreground)' }}>{b.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[b.status] }} />
                        <span style={{ color: STATUS_COLORS[b.status] }}>{b.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue + Assignments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Team Revenue Breakdown</h2>
            <div className="space-y-3">
              {MOCK_BROKERS.sort((a, b) => parseInt(b.revenue.replace(/\D/g, '')) - parseInt(a.revenue.replace(/\D/g, ''))).map(b => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{b.name}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{b.revenue}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(parseInt(b.revenue.replace(/\D/g, '')) / 51000) * 100}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Pending Assignments</h2>
            <div className="space-y-2">
              {[
                { customer: 'Elena Vasquez', priority: 'High', source: 'Organic', assignTo: 'Unassigned' },
                { customer: 'Omar Hassan', priority: 'High', source: 'Affiliate', assignTo: 'Unassigned' },
                { customer: 'Wei Zhang', priority: 'Medium', source: 'Direct', assignTo: 'Unassigned' },
                { customer: 'Sofia Rossi', priority: 'Low', source: 'Referral', assignTo: 'Unassigned' },
                { customer: 'Carlos Mendez', priority: 'Medium', source: 'Organic', assignTo: 'Unassigned' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.priority === 'High' ? '#ef4444' : a.priority === 'Medium' ? '#f59e0b' : '#22c55e' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{a.customer}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.source} · {a.priority}</p>
                  </div>
                  <button className="text-xs px-2.5 py-1 rounded border shrink-0 transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
