'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, ClipboardList, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
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

const MOCK_TEAM = [
  { id: 'm1', name: 'James Park', role: 'Broker', customers: 18, calls: 34, conversion: '38%', status: 'Online', score: 92 },
  { id: 'm2', name: 'Maria Santos', role: 'Retention Broker', customers: 22, calls: 41, conversion: '31%', status: 'Online', score: 87 },
  { id: 'm3', name: 'Alex Rivera', role: 'Operator', customers: 12, calls: 28, conversion: '42%', status: 'Away', score: 95 },
  { id: 'm4', name: 'Priya Sharma', role: 'Desk Broker', customers: 15, calls: 22, conversion: '35%', status: 'Online', score: 88 },
];

const STATUS_COLORS: Record<string, string> = { Online: '#22c55e', Away: '#f59e0b', Offline: '#6b7280' };

export default function TeamLeaderWorkspace() {
  return (
    <StaffShell
      role="team_leader"
      staffName="Carlos Mendez"
      staffEmail="carlos.mendez@cryptovault.app"
      managerName="Sarah Chen"
      managerRole="Broker Manager"
      managerStatus="online"
      managerId="staff-001"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Team Leader Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Lead your team, track performance, and manage escalations</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Team Members" value={4} sub="3 online now" icon={Users} />
          <KpiCard label="Team Conversion" value="37%" sub="+2% this week" icon={TrendingUp} color="#22c55e" />
          <KpiCard label="Open Tasks" value={8} sub="2 overdue" icon={ClipboardList} color="#f59e0b" />
          <KpiCard label="Escalations" value={2} sub="Needs attention" icon={AlertTriangle} color="#ef4444" />
        </div>

        {/* Team Performance */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Team Performance</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Member', 'Role', 'Customers', 'Calls', 'Conversion', 'Score', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAM.map(m => (
                  <tr key={m.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{m.name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{m.role}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{m.customers}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{m.calls}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{m.conversion}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: m.score >= 90 ? '#22c55e' : 'var(--primary)' }} />
                        </div>
                        <span className="text-xs font-bold w-6 shrink-0" style={{ color: 'var(--foreground)' }}>{m.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[m.status] }} />
                        <span style={{ color: STATUS_COLORS[m.status] }}>{m.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks + Escalations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Team Tasks</h2>
            <div className="space-y-2">
              {[
                { task: 'Review James Park weekly report', assignee: 'James Park', due: 'Today', done: false },
                { task: 'Approve Maria Santos customer notes', assignee: 'Maria Santos', due: 'Today', done: true },
                { task: 'Schedule team briefing', assignee: 'All', due: 'Tomorrow', done: false },
                { task: 'Submit performance report to manager', assignee: 'You', due: 'Friday', done: false },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  {t.done
                    ? <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                    : <Clock size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                  }
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: t.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.task}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{t.assignee} · {t.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Escalations</h2>
            <div className="space-y-2">
              {[
                { member: 'Alex Rivera', issue: 'Customer complaint — needs immediate response', severity: 'High', time: '30 min ago' },
                { member: 'Priya Sharma', issue: 'Missed 3 follow-ups — workload issue', severity: 'Medium', time: '2 hrs ago' },
              ].map((e, i) => (
                <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{e.member}</span>
                    <span className="text-xs font-medium" style={{ color: e.severity === 'High' ? '#ef4444' : '#f59e0b' }}>{e.severity}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{e.issue}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{e.time}</span>
                    <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      Resolve
                    </button>
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
