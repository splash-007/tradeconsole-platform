'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, PhoneCall, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Alex Morgan', balance: '$24,850', lastDeposit: '14 days ago', riskLevel: 'Low', lastContact: '2 hrs ago', status: 'Active' },
  { id: 'c2', name: 'Marcus Whitfield', balance: '$8,420', lastDeposit: '32 days ago', riskLevel: 'High', lastContact: '3 days ago', status: 'At Risk' },
  { id: 'c3', name: 'Priya Sharma', balance: '$15,200', lastDeposit: '7 days ago', riskLevel: 'Low', lastContact: '1 hr ago', status: 'Active' },
  { id: 'c4', name: 'Aisha Al-Rashidi', balance: '$52,000', lastDeposit: '21 days ago', riskLevel: 'Medium', lastContact: '1 day ago', status: 'Monitoring' },
  { id: 'c5', name: 'David Kim', balance: '$9,100', lastDeposit: '45 days ago', riskLevel: 'High', lastContact: '5 days ago', status: 'Churning' },
];

const RISK_COLORS: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { Active: '#22c55e', 'At Risk': '#f59e0b', Monitoring: '#3b82f6', Churning: '#ef4444' };

export default function RetentionBrokerWorkspace() {
  return (
    <StaffShell
      role="retention_broker"
      staffName="Maria Santos"
      staffEmail="maria.santos@cryonfx.app"
      managerName="Diana Reyes"
      managerRole="Retention Manager"
      managerStatus="online"
      managerId="staff-020"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Retention Broker Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Retain active clients, re-engage at-risk accounts, prevent churn</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Assigned Customers" value={22} sub="4 at risk" icon={Users} />
          <KpiCard label="Retention Rate" value="78%" sub="+3% this week" positive icon={TrendingUp} color="#22c55e" />
          <KpiCard label="Calls Today" value={13} sub="8 answered" icon={PhoneCall} color="#3b82f6" />
          <KpiCard label="Avg Balance" value="$21.9K" sub="+$1.2K vs last week" positive icon={DollarSign} color="#f59e0b" />
        </div>

        {/* Customer Retention Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Retention Portfolio</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>2 churning</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>22 total</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Balance', 'Last Deposit', 'Risk', 'Last Contact', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_CUSTOMERS.map(c => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{c.balance}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastDeposit}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium" style={{ color: RISK_COLORS[c.riskLevel] }}>{c.riskLevel}</span>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.lastContact}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retention Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Retention Metrics</h2>
            <div className="space-y-3">
              {[
                { label: 'Retained This Month', value: 18, target: 22, pct: 82 },
                { label: 'Re-deposits Secured', value: 7, target: 10, pct: 70 },
                { label: 'Churn Prevented', value: 4, target: 5, pct: 80 },
                { label: 'Avg Contact Frequency', value: '3.2/wk', target: '4/wk', pct: 80, raw: 80 },
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
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>At-Risk Alerts</h2>
            <div className="space-y-2">
              {[
                { name: 'Marcus Whitfield', reason: 'No deposit in 32 days', severity: 'High' },
                { name: 'David Kim', reason: 'No login in 5 days, balance declining', severity: 'Critical' },
                { name: 'Aisha Al-Rashidi', reason: 'Reduced trading frequency', severity: 'Medium' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border" style={{ backgroundColor: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.severity === 'Critical' ? '#ef4444' : a.severity === 'High' ? '#f59e0b' : '#3b82f6' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{a.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{a.reason}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: a.severity === 'Critical' ? '#ef4444' : a.severity === 'High' ? '#f59e0b' : '#3b82f6' }}>{a.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
