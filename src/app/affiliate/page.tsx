'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Users, DollarSign, Megaphone, Target, ArrowUpRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ElementType;
  trend?: string;
}

function KpiCard({ label, value, sub, color = 'var(--primary)', icon: Icon, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: '#22c55e' }}>
            <ArrowUpRight size={11} />{trend}
          </span>
        )}
      </div>
      <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5 opacity-70" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
    </div>
  );
}

const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'Summer Crypto 2026', status: 'Active', registrations: 284, conversions: 42, revenue: '$18,400', ctr: '3.2%' },
  { id: 'c2', name: 'BTC Halving Push', status: 'Active', registrations: 156, conversions: 28, revenue: '$12,600', ctr: '2.8%' },
  { id: 'c3', name: 'EU Expansion Q3', status: 'Paused', registrations: 89, conversions: 11, revenue: '$4,950', ctr: '1.9%' },
  { id: 'c4', name: 'Referral Program', status: 'Active', registrations: 412, conversions: 67, revenue: '$30,150', ctr: '4.1%' },
];

export default function AffiliateWorkspace() {
  return (
    <StaffShell
      role="affiliate"
      staffName="Marco Rossi"
      staffEmail="marco.rossi@cryptovault.app"
      managerName="Elena Vasquez"
      managerRole="Affiliate Manager"
      managerStatus="online"
      managerId="staff-010"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Affiliate Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Your performance, campaigns, and commissions</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Total Registrations" value="941" sub="This month" icon={Users} trend="+12%" />
          <KpiCard label="Conversions" value="148" sub="FTD rate: 15.7%" icon={Target} color="#22c55e" trend="+8%" />
          <KpiCard label="Total Revenue" value="$66,100" sub="Commission earned" icon={DollarSign} color="#3b82f6" trend="+18%" />
          <KpiCard label="Active Campaigns" value={3} sub="1 paused" icon={Megaphone} color="#f59e0b" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Campaigns */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>My Campaigns</h2>
              <button className="text-xs px-3 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                + New Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Campaign', 'Status', 'Registrations', 'Conversions', 'Revenue', 'CTR'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CAMPAIGNS.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded" style={{
                          backgroundColor: c.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                          color: c.status === 'Active' ? '#22c55e' : 'var(--muted-foreground)',
                        }}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{c.registrations}</td>
                      <td className="px-4 py-2.5" style={{ color: '#22c55e' }}>{c.conversions}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--primary)' }}>{c.revenue}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{c.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission Summary */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Commission Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'This Month', value: '$8,240', color: 'var(--primary)' },
                { label: 'Last Month', value: '$6,980', color: 'var(--foreground)' },
                { label: 'Pending', value: '$1,450', color: '#f59e0b' },
                { label: 'Total Earned', value: '$66,100', color: '#22c55e' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>Traffic This Month</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p style={{ color: 'var(--muted-foreground)' }}>Clicks</p><p className="font-bold" style={{ color: 'var(--foreground)' }}>29,400</p></div>
                  <div><p style={{ color: 'var(--muted-foreground)' }}>Unique</p><p className="font-bold" style={{ color: 'var(--foreground)' }}>18,200</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
