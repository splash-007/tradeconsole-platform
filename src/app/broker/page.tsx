'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, PhoneCall, TrendingUp, ClipboardList, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ElementType;
}

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
  { id: 'c1', name: 'Alex Morgan', status: 'Active', lastContact: '2 hrs ago', balance: '$24,850', priority: 'High' },
  { id: 'c2', name: 'Marcus Whitfield', status: 'Follow-up', lastContact: '1 day ago', balance: '$8,420', priority: 'Medium' },
  { id: 'c3', name: 'Priya Sharma', status: 'Active', lastContact: '3 hrs ago', balance: '$15,200', priority: 'High' },
  { id: 'c4', name: 'Aisha Al-Rashidi', status: 'Pending', lastContact: '2 days ago', balance: '$52,000', priority: 'Low' },
  { id: 'c5', name: 'David Kim', status: 'Active', lastContact: '30 min ago', balance: '$9,100', priority: 'Medium' },
];

const MOCK_TASKS = [
  { id: 't1', title: 'Follow-up call with Alex Morgan', due: 'Today 3pm', priority: 'High', done: false },
  { id: 't2', title: 'Review trading activity for Priya Sharma', due: 'Today 5pm', priority: 'Medium', done: false },
  { id: 't3', title: 'Send deposit confirmation to Marcus', due: 'Tomorrow', priority: 'Low', done: true },
  { id: 't4', title: 'Update notes for Aisha Al-Rashidi', due: 'Tomorrow', priority: 'Medium', done: false },
];

const PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

export default function BrokerWorkspace() {
  return (
    <StaffShell
      role="broker"
      staffName="James Park"
      staffEmail="james.park@cryptovault.app"
      managerName="Sarah Chen"
      managerRole="Broker Manager"
      managerStatus="online"
      managerId="staff-001"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Broker Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Thursday, August 28 · Your assigned customers and tasks</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Assigned Customers" value={18} sub="5 need follow-up" icon={Users} />
          <KpiCard label="Open Tasks" value={4} sub="1 overdue" icon={ClipboardList} color="#f59e0b" />
          <KpiCard label="Calls Today" value={7} sub="3 scheduled" icon={PhoneCall} color="#3b82f6" />
          <KpiCard label="Conversion Rate" value="34%" sub="+2% this week" icon={TrendingUp} color="#22c55e" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Assigned Customers */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Assigned Customers</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>18 total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Status', 'Last Contact', 'Balance', 'Priority'].map(h => (
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
                          backgroundColor: c.status === 'Active' ? 'rgba(34,197,94,0.1)' : c.status === 'Follow-up' ? 'rgba(245,196,0,0.1)' : 'rgba(107,114,128,0.1)',
                          color: c.status === 'Active' ? '#22c55e' : c.status === 'Follow-up' ? 'var(--primary)' : 'var(--muted-foreground)',
                        }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastContact}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.balance}</td>
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
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>4 open</span>
            </div>
            <div className="p-3 space-y-2">
              {MOCK_TASKS.map(t => (
                <div key={t.id} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>This Week's Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Calls Made', value: '34', target: '40', pct: 85 },
              { label: 'Deposits Facilitated', value: '6', target: '8', pct: 75 },
              { label: 'Messages Sent', value: '127', target: '100', pct: 100 },
              { label: 'Tasks Completed', value: '18', target: '20', pct: 90 },
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
