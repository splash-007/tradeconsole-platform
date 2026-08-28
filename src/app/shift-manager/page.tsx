'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Clock, Users, AlertTriangle, BarChart2, List } from 'lucide-react';
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

const PRESENCE_COLORS: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#6b7280',
};

const MOCK_STAFF_ONLINE = [
  { id: 's1', name: 'James Park', role: 'FTD Broker', status: 'online', customers: 9, tasks: 3 },
  { id: 's2', name: 'Emma Wilson', role: 'Broker', status: 'online', customers: 14, tasks: 5 },
  { id: 's3', name: 'Carlos Mendez', role: 'Retention Broker', status: 'busy', customers: 18, tasks: 2 },
  { id: 's4', name: 'Yuki Tanaka', role: 'Desk Broker', status: 'away', customers: 11, tasks: 4 },
  { id: 's5', name: 'Anna Kowalski', role: 'Operator', status: 'online', customers: 7, tasks: 1 },
  { id: 's6', name: 'Liam Johnson', role: 'Compliance Broker', status: 'offline', customers: 0, tasks: 0 },
];

const MOCK_QUEUE = [
  { id: 'q1', customer: 'Thomas Bergmann', type: 'New Lead', wait: '5 min', priority: 'High' },
  { id: 'q2', customer: 'Sofia Garcia', type: 'Follow-up', wait: '12 min', priority: 'Medium' },
  { id: 'q3', customer: 'David Lee', type: 'Deposit Query', wait: '18 min', priority: 'High' },
  { id: 'q4', customer: 'Maria Kowalski', type: 'KYC Question', wait: '25 min', priority: 'Low' },
];

const MOCK_ESCALATIONS = [
  { id: 'e1', from: 'James Park', customer: 'Alex Morgan', reason: 'Withdrawal dispute', time: '10 min ago' },
  { id: 'e2', from: 'Emma Wilson', customer: 'Marcus Whitfield', reason: 'Account access issue', time: '35 min ago' },
];

export default function ShiftManagerWorkspace() {
  const now = new Date();
  const shiftStart = '08:00';
  const shiftEnd = '16:00';

  return (
    <StaffShell
      role="shift_manager"
      staffName="Alex Torres"
      staffEmail="alex.torres@cryptovault.app"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Shift Manager</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Current shift: {shiftStart} – {shiftEnd} · Morning Shift</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.06)' }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Shift Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Staff Online" value={4} sub="2 away/busy" icon={Users} color="#22c55e" />
          <KpiCard label="Customer Queue" value={4} sub="2 high priority" icon={List} color="#f59e0b" />
          <KpiCard label="Escalations" value={2} sub="Needs attention" icon={AlertTriangle} color="#ef4444" />
          <KpiCard label="Shift Completion" value="62%" sub="4.5 hrs remaining" icon={BarChart2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Staff Status */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Staff This Shift</h2>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />Online: 3</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />Away: 1</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }} />Off: 1</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Staff', 'Role', 'Status', 'Customers', 'Tasks'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STAFF_ONLINE.map(s => (
                    <tr key={s.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{s.role}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRESENCE_COLORS[s.status] }} />
                          <span className="capitalize" style={{ color: PRESENCE_COLORS[s.status] }}>{s.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{s.customers}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{s.tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Queue + Escalations */}
          <div className="space-y-4">
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Customer Queue</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {MOCK_QUEUE.map(q => (
                  <div key={q.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{q.customer}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.type} · {q.wait}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: q.priority === 'High' ? '#ef4444' : q.priority === 'Medium' ? '#f59e0b' : 'var(--muted-foreground)' }}>
                      {q.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <AlertTriangle size={13} style={{ color: '#ef4444' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Escalations</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {MOCK_ESCALATIONS.map(e => (
                  <div key={e.id} className="px-4 py-3">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{e.customer}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>From {e.from} · {e.time}</p>
                    <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{e.reason}</p>
                    <button className="mt-1.5 text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                      Handle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
