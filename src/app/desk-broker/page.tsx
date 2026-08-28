'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, PhoneCall, TrendingUp, ClipboardList } from 'lucide-react';
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
  { id: 'c1', name: 'Elena Vasquez', balance: '$18,400', lastContact: '1 hr ago', status: 'Active', priority: 'High' },
  { id: 'c2', name: 'Omar Hassan', balance: '$7,200', lastContact: '3 hrs ago', status: 'Follow-up', priority: 'Medium' },
  { id: 'c3', name: 'Natasha Ivanova', balance: '$31,000', lastContact: '30 min ago', status: 'Active', priority: 'High' },
  { id: 'c4', name: 'Wei Zhang', balance: '$5,800', lastContact: '2 days ago', status: 'Pending', priority: 'Low' },
  { id: 'c5', name: 'Sofia Rossi', balance: '$12,500', lastContact: '4 hrs ago', status: 'Active', priority: 'Medium' },
];

const PRIORITY_COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

export default function DeskBrokerWorkspace() {
  return (
    <StaffShell
      role="desk_broker"
      staffName="Alex Rivera"
      staffEmail="alex.rivera@cryptovault.app"
      managerName="Michael Torres"
      managerRole="Desk Manager"
      managerStatus="online"
      managerId="staff-060"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Desk Broker Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Your assigned desk customers, tasks, and daily performance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Assigned Customers" value={15} sub="4 active now" icon={Users} />
          <KpiCard label="Open Tasks" value={5} sub="2 overdue" icon={ClipboardList} color="#f59e0b" />
          <KpiCard label="Calls Today" value={9} sub="5 completed" icon={PhoneCall} color="#3b82f6" />
          <KpiCard label="Conversion Rate" value="38%" sub="+3% this week" icon={TrendingUp} color="#22c55e" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>My Customers</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>15 assigned</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Balance', 'Last Contact', 'Status', 'Priority', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CUSTOMERS.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{c.balance}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastContact}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{
                          backgroundColor: c.status === 'Active' ? 'rgba(34,197,94,0.1)' : c.status === 'Follow-up' ? 'rgba(245,196,0,0.1)' : 'rgba(107,114,128,0.1)',
                          color: c.status === 'Active' ? '#22c55e' : c.status === 'Follow-up' ? 'var(--primary)' : 'var(--muted-foreground)',
                        }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium" style={{ color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Performance</h2>
            <div className="space-y-3">
              {[
                { label: 'Calls Made', value: 9, target: 12, pct: 75 },
                { label: 'Deposits', value: 3, target: 5, pct: 60 },
                { label: 'Tasks Done', value: 7, target: 8, pct: 88 },
                { label: 'Response Rate', value: '94%', target: '90%', pct: 100, raw: 100 },
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
      </div>
    </StaffShell>
  );
}
