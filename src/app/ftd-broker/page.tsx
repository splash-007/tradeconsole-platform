'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { PhoneCall, TrendingUp, Target, DollarSign, CheckCircle } from 'lucide-react';
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

const MOCK_PENDING_FTD = [
  { id: 'f1', name: 'Lena Fischer', registered: '2 days ago', contacted: 3, lastCall: '4 hrs ago', depositHint: '$500', urgency: 'Hot' },
  { id: 'f2', name: 'Omar Hassan', registered: '3 days ago', contacted: 1, lastCall: '1 day ago', depositHint: '$1,000', urgency: 'Warm' },
  { id: 'f3', name: 'Natasha Ivanova', registered: '1 day ago', contacted: 2, lastCall: '2 hrs ago', depositHint: '$250', urgency: 'Hot' },
  { id: 'f4', name: 'Wei Zhang', registered: '5 days ago', contacted: 5, lastCall: '3 days ago', depositHint: '$2,000', urgency: 'Cold' },
  { id: 'f5', name: 'Sofia Rossi', registered: '1 day ago', contacted: 0, lastCall: 'Never', depositHint: '$750', urgency: 'New' },
];

const URGENCY_COLORS: Record<string, string> = {
  Hot: '#ef4444', Warm: '#f59e0b', Cold: '#3b82f6', New: '#22c55e',
};

export default function FTDBrokerWorkspace() {
  return (
    <StaffShell
      role="ftd_broker"
      staffName="James Park"
      staffEmail="james.park@cryptovault.app"
      managerName="Michael Torres"
      managerRole="Conversion Manager"
      managerStatus="online"
      managerId="staff-010"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>FTD Broker Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>First-time deposit pipeline — convert qualified leads to depositors</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Pending FTD" value={6} sub="3 hot leads" icon={Target} />
          <KpiCard label="FTDs This Month" value={14} sub="+3 vs last month" icon={DollarSign} color="#22c55e" />
          <KpiCard label="Calls Today" value={11} sub="6 answered" icon={PhoneCall} color="#3b82f6" />
          <KpiCard label="Conversion Rate" value="42%" sub="+4% this week" icon={TrendingUp} color="#f59e0b" />
        </div>

        {/* FTD Pipeline */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Pending FTD Pipeline</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>6 pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Lead', 'Registered', 'Contacts', 'Last Call', 'Est. Deposit', 'Urgency', 'Action'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PENDING_FTD.map(f => (
                  <tr key={f.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{f.name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{f.registered}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{f.contacted}x</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{f.lastCall}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{f.depositHint}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${URGENCY_COLORS[f.urgency]}18`, color: URGENCY_COLORS[f.urgency] }}>
                        {f.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        Call Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats + Follow-ups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Monthly FTD Progress</h2>
            <div className="space-y-3">
              {[
                { label: 'FTDs Converted', value: 14, target: 20, pct: 70 },
                { label: 'Calls Made', value: 89, target: 100, pct: 89 },
                { label: 'Follow-ups Done', value: 34, target: 40, pct: 85 },
                { label: 'Revenue Generated', value: '$28,000', target: '$40,000', pct: 70, raw: 70 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.label}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{m.value} / {m.target}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(m.pct, 100)}%`, backgroundColor: m.pct >= 100 ? '#22c55e' : 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Today's Follow-up Schedule</h2>
            <div className="space-y-2">
              {[
                { time: '10:00', name: 'Lena Fischer', note: 'Interested in $500 deposit', done: true },
                { time: '11:30', name: 'Omar Hassan', note: 'Needs more info on platform', done: false },
                { time: '14:00', name: 'Natasha Ivanova', note: 'Ready to deposit — confirm amount', done: false },
                { time: '16:00', name: 'Sofia Rossi', note: 'First contact call', done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-mono font-bold shrink-0 mt-0.5" style={{ color: s.done ? 'var(--muted-foreground)' : 'var(--primary)' }}>{s.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: s.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.note}</p>
                  </div>
                  {s.done && <CheckCircle size={13} style={{ color: '#22c55e' }} className="shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
