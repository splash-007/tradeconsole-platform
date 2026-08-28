'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, ClipboardList, PhoneCall, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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

const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Elena Vasquez', status: 'New', lastContact: 'Just now', stage: 'Registration', priority: 'High' },
  { id: 'c2', name: 'Tom Bradley', status: 'Contacted', lastContact: '1 hr ago', stage: 'Qualification', priority: 'Medium' },
  { id: 'c3', name: 'Yuki Tanaka', status: 'New', lastContact: '2 hrs ago', stage: 'Registration', priority: 'High' },
  { id: 'c4', name: 'Carlos Mendez', status: 'Follow-up', lastContact: '1 day ago', stage: 'Qualification', priority: 'Low' },
  { id: 'c5', name: 'Fatima Al-Zahra', status: 'New', lastContact: '3 hrs ago', stage: 'Registration', priority: 'Medium' },
];

const MOCK_TASKS = [
  { id: 't1', title: 'Call Elena Vasquez — new registration', due: 'Now', priority: 'High', done: false },
  { id: 't2', title: 'Send welcome email to Yuki Tanaka', due: 'Today 2pm', priority: 'High', done: false },
  { id: 't3', title: 'Follow-up with Carlos Mendez', due: 'Tomorrow', priority: 'Low', done: false },
  { id: 't4', title: 'Update qualification notes for Tom Bradley', due: 'Today 5pm', priority: 'Medium', done: true },
];

const PRIORITY_COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

export default function OperatorWorkspace() {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <StaffShell
      role="operator"
      staffName="Alex Rivera"
      staffEmail="alex.rivera@cryptovault.app"
      managerName="Sarah Chen"
      managerRole="Broker Manager"
      managerStatus="online"
      managerId="staff-001"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Operator Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>New registrations, qualification tasks, and customer outreach</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Assigned Customers" value={12} sub="5 new today" icon={Users} />
          <KpiCard label="Open Tasks" value={3} sub="1 urgent" icon={ClipboardList} color="#f59e0b" />
          <KpiCard label="Calls Today" value={9} sub="4 answered" icon={PhoneCall} color="#3b82f6" />
          <KpiCard label="Avg Response Time" value="4m" sub="-1m vs yesterday" icon={Clock} color="#22c55e" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer Queue */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Customer Queue</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>12 assigned</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Status', 'Last Contact', 'Stage', 'Priority'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CUSTOMERS.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{
                          backgroundColor: c.status === 'New' ? 'rgba(59,130,246,0.1)' : c.status === 'Contacted' ? 'rgba(34,197,94,0.1)' : 'rgba(245,196,0,0.1)',
                          color: c.status === 'New' ? '#3b82f6' : c.status === 'Contacted' ? '#22c55e' : 'var(--primary)',
                        }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastContact}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.stage}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium" style={{ color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>My Tasks</h2>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tasks.filter(t => !t.done).length} open</span>
            </div>
            <div className="p-3 space-y-2">
              {tasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors hover:bg-white/5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  {t.done
                    ? <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                    : <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: PRIORITY_COLORS[t.priority] }} />
                  }
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug" style={{ color: t.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} style={{ color: 'var(--muted-foreground)' }} />
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.due}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>This Week's Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Calls Made', value: '28', target: '35', pct: 80 },
              { label: 'Customers Qualified', value: '9', target: '12', pct: 75 },
              { label: 'Response Rate', value: '91%', target: '90%', pct: 100 },
              { label: 'Tasks Completed', value: '14', target: '15', pct: 93 },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{m.value}</p>
                <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Target: {m.target}</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(m.pct, 100)}%`, backgroundColor: m.pct >= 100 ? '#22c55e' : 'var(--primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
