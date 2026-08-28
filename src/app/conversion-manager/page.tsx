'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, Filter, Target, DollarSign } from 'lucide-react';
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

const MOCK_BROKERS = [
  { id: 'b1', name: 'James Park', assigned: 9, ftds: 14, rate: '42%', revenue: '$28,000', status: 'Online' },
  { id: 'b2', name: 'Alex Rivera', assigned: 7, ftds: 11, rate: '38%', revenue: '$22,000', status: 'Online' },
  { id: 'b3', name: 'Priya Sharma', assigned: 5, ftds: 7, rate: '35%', revenue: '$14,000', status: 'Away' },
];

const MOCK_REGISTRATIONS = [
  { id: 'r1', name: 'Elena Vasquez', source: 'Organic', registered: '2 hrs ago', assigned: 'James Park', status: 'Assigned' },
  { id: 'r2', name: 'Omar Hassan', source: 'Affiliate', registered: '4 hrs ago', assigned: 'Unassigned', status: 'Pending' },
  { id: 'r3', name: 'Natasha Ivanova', source: 'Direct', registered: '1 day ago', assigned: 'Alex Rivera', status: 'Contacted' },
  { id: 'r4', name: 'Wei Zhang', source: 'Referral', registered: '2 days ago', assigned: 'Priya Sharma', status: 'In Progress' },
];

const STATUS_COLORS: Record<string, string> = { Assigned: '#3b82f6', Pending: '#f59e0b', Contacted: '#22c55e', 'In Progress': 'var(--primary)' };

export default function ConversionManagerWorkspace() {
  const [activeTab, setActiveTab] = useState<'brokers' | 'registrations' | 'funnel'>('brokers');

  return (
    <StaffShell
      role="conversion_manager"
      staffName="Michael Torres"
      staffEmail="michael.torres@cryptovault.app"
      managerName="Robert Chen"
      managerRole="VP Sales"
      managerStatus="online"
      managerId="staff-050"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Conversion Manager Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage FTD brokers, registration pipeline, and conversion funnel</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="FTD Brokers" value={3} sub="2 online" icon={Users} />
          <KpiCard label="FTDs This Month" value={32} sub="+8 vs last month" icon={Target} color="#22c55e" />
          <KpiCard label="Pending Leads" value={14} sub="6 unassigned" icon={Filter} color="#f59e0b" />
          <KpiCard label="Team Revenue" value="$64K" sub="+22% MTD" icon={DollarSign} color="#3b82f6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['brokers', 'registrations', 'funnel'] as const).map(tab => (
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

        {activeTab === 'brokers' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>FTD Broker Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Broker', 'Assigned', 'FTDs', 'Rate', 'Revenue', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BROKERS.map(b => (
                    <tr key={b.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{b.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{b.assigned}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{b.ftds}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: '#22c55e' }}>{b.rate}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{b.revenue}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.status === 'Online' ? '#22c55e' : '#f59e0b' }} />
                          <span style={{ color: b.status === 'Online' ? '#22c55e' : '#f59e0b' }}>{b.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Registration Pipeline</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>14 pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Lead', 'Source', 'Registered', 'Assigned To', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_REGISTRATIONS.map(r => (
                    <tr key={r.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{r.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{r.source}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{r.registered}</td>
                      <td className="px-4 py-2.5" style={{ color: r.assigned === 'Unassigned' ? '#ef4444' : 'var(--foreground)' }}>{r.assigned}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${STATUS_COLORS[r.status]}18`, color: STATUS_COLORS[r.status] }}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          {r.assigned === 'Unassigned' ? 'Assign' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>FTD Conversion Funnel</h2>
            <div className="space-y-2">
              {[
                { stage: 'Registrations', count: 284, pct: 100, color: '#3b82f6' },
                { stage: 'Qualified Leads', count: 187, pct: 66, color: '#8b5cf6' },
                { stage: 'First Contact', count: 142, pct: 50, color: '#f59e0b' },
                { stage: 'Interested', count: 89, pct: 31, color: 'var(--primary)' },
                { stage: 'FTD Converted', count: 32, pct: 11, color: '#22c55e' },
              ].map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-xs w-32 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{s.stage}</span>
                  <div className="flex-1 h-6 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded flex items-center px-2" style={{ width: `${s.pct}%`, backgroundColor: s.color }}>
                      <span className="text-xs font-bold text-white">{s.count}</span>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right shrink-0" style={{ color: 'var(--muted-foreground)' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
