'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, UserCheck, BarChart2, AlertTriangle, Activity } from 'lucide-react';
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

const MOCK_DESK_BROKERS = [
  { id: 'db1', name: 'Alex Rivera', customers: 15, activeNow: 3, calls: 8, status: 'Online', load: 75 },
  { id: 'db2', name: 'Priya Sharma', customers: 20, activeNow: 5, calls: 11, status: 'Busy', load: 90 },
  { id: 'db3', name: 'Tom Bradley', customers: 12, activeNow: 2, calls: 6, status: 'Online', load: 60 },
  { id: 'db4', name: 'Elena Vasquez', customers: 18, activeNow: 4, calls: 9, status: 'Away', load: 80 },
];

const STATUS_COLORS: Record<string, string> = { Online: '#22c55e', Busy: '#ef4444', Away: '#f59e0b', Offline: '#6b7280' };

export default function DeskManagerWorkspace() {
  return (
    <StaffShell
      role="desk_manager"
      staffName="Michael Torres"
      staffEmail="michael.torres@cryptovault.app"
      managerName="Sarah Chen"
      managerRole="Broker Manager"
      managerStatus="online"
      managerId="staff-001"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Desk Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Real-time desk oversight, broker workload, and customer assignments</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Desk Brokers" value={4} sub="3 online now" icon={Users} />
          <KpiCard label="Active Customers" value={14} sub="Across all brokers" icon={Activity} color="#22c55e" />
          <KpiCard label="Pending Assignments" value={6} sub="2 high priority" icon={UserCheck} color="#f59e0b" />
          <KpiCard label="Avg Broker Load" value="76%" sub="+5% vs yesterday" icon={BarChart2} color="#3b82f6" />
        </div>

        {/* Desk Broker Status */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Desk Broker Status</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Broker', 'Customers', 'Active Now', 'Calls Today', 'Workload', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_DESK_BROKERS.map(b => (
                  <tr key={b.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{b.name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{b.customers}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{b.activeNow}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{b.calls}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${b.load}%`, backgroundColor: b.load >= 85 ? '#ef4444' : b.load >= 70 ? '#f59e0b' : '#22c55e' }} />
                        </div>
                        <span className="text-xs w-8 shrink-0" style={{ color: 'var(--foreground)' }}>{b.load}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[b.status] }} />
                        <span style={{ color: STATUS_COLORS[b.status] }}>{b.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift Overview + Escalations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Shift Performance</h2>
            <div className="space-y-3">
              {[
                { label: 'Customers Handled', value: 47, target: 60, pct: 78 },
                { label: 'Calls Completed', value: 34, target: 40, pct: 85 },
                { label: 'Assignments Made', value: 12, target: 15, pct: 80 },
                { label: 'Escalations Resolved', value: 3, target: 5, pct: 60 },
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
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Escalations & Alerts</h2>
            <div className="space-y-2">
              {[
                { broker: 'Priya Sharma', issue: 'Workload at 90% — consider reassignment', severity: 'High' },
                { broker: 'Elena Vasquez', issue: 'Customer complaint pending review', severity: 'Medium' },
                { broker: 'Alex Rivera', issue: 'Missed follow-up — 2 customers waiting', severity: 'Low' },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border" style={{ backgroundColor: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.12)' }}>
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: e.severity === 'High' ? '#ef4444' : e.severity === 'Medium' ? '#f59e0b' : '#3b82f6' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{e.broker}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{e.issue}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: e.severity === 'High' ? '#ef4444' : e.severity === 'Medium' ? '#f59e0b' : '#3b82f6' }}>{e.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
