'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, Activity, ClipboardList, UserCog } from 'lucide-react';
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

const MOCK_STAFF = [
  { id: 's1', name: 'James Park', role: 'FTD Broker', customers: 9, status: 'Online', tasks: 3 },
  { id: 's2', name: 'Maria Santos', role: 'Retention Broker', customers: 22, status: 'Online', tasks: 5 },
  { id: 's3', name: 'Alex Rivera', role: 'Operator', customers: 12, status: 'Away', tasks: 2 },
  { id: 's4', name: 'Priya Sharma', role: 'Desk Broker', customers: 15, status: 'Online', tasks: 4 },
  { id: 's5', name: 'Tom Bradley', role: 'Broker', customers: 18, status: 'Offline', tasks: 1 },
];

const STATUS_COLORS: Record<string, string> = { Online: '#22c55e', Away: '#f59e0b', Offline: '#6b7280' };

export default function OfficeWorkspace() {
  const [activeTab, setActiveTab] = useState<'staff' | 'customers' | 'activity'>('staff');

  return (
    <StaffShell
      role="office"
      staffName="Natasha Ivanova"
      staffEmail="natasha.ivanova@cryptovault.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Office Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Office-wide staff overview, customer management, and activity tracking</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Staff Online" value={3} sub="5 total in office" icon={Users} />
          <KpiCard label="Active Customers" value={76} sub="Across all staff" icon={UserCog} color="#22c55e" />
          <KpiCard label="Open Tasks" value={15} sub="4 overdue" icon={ClipboardList} color="#f59e0b" />
          <KpiCard label="Office Activity" value="High" sub="Peak hours" icon={Activity} color="#3b82f6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['staff', 'customers', 'activity'] as const).map(tab => (
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

        {activeTab === 'staff' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Office Staff</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>3 online</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Staff', 'Role', 'Customers', 'Open Tasks', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STAFF.map(s => (
                    <tr key={s.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{s.role}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{s.customers}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{s.tasks}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                          <span style={{ color: STATUS_COLORS[s.status] }}>{s.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Customer Distribution</h2>
            <div className="space-y-3">
              {MOCK_STAFF.map(s => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{s.name} <span style={{ color: 'var(--muted-foreground)' }}>({s.role})</span></span>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{s.customers} customers</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.customers / 22) * 100}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Recent Office Activity</h2>
            <div className="space-y-2">
              {[
                { actor: 'James Park', action: 'Completed FTD call with Lena Fischer', time: '5 min ago', type: 'success' },
                { actor: 'Maria Santos', action: 'Updated retention notes for Marcus Whitfield', time: '12 min ago', type: 'info' },
                { actor: 'Alex Rivera', action: 'New customer Elena Vasquez assigned', time: '18 min ago', type: 'info' },
                { actor: 'Priya Sharma', action: 'Escalation raised — customer complaint', time: '25 min ago', type: 'warning' },
                { actor: 'Tom Bradley', action: 'Deposit confirmed for Wei Zhang', time: '34 min ago', type: 'success' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.type === 'success' ? '#22c55e' : a.type === 'warning' ? '#f59e0b' : '#3b82f6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'var(--foreground)' }}>
                      <span className="font-medium">{a.actor}</span> — {a.action}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{a.time}</p>
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
