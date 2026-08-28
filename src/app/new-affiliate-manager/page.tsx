'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { UserPlus, ClipboardList, Megaphone, TrendingUp } from 'lucide-react';
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

const MOCK_APPLICATIONS = [
  { id: 'a1', name: 'TechTraffic Ltd', contact: 'John Smith', submitted: '1 day ago', source: 'Referral', status: 'Under Review', traffic: '~500/mo' },
  { id: 'a2', name: 'DigitalLeads Pro', contact: 'Anna Müller', submitted: '2 days ago', source: 'Direct', status: 'Pending Docs', traffic: '~1,200/mo' },
  { id: 'a3', name: 'CryptoMedia Hub', contact: 'Raj Patel', submitted: '3 days ago', source: 'Partner', status: 'Approved', traffic: '~800/mo' },
  { id: 'a4', name: 'FX Signals Group', contact: 'Elena Kozlov', submitted: '4 days ago', source: 'Referral', status: 'Rejected', traffic: '~200/mo' },
];

const STATUS_COLORS: Record<string, string> = {
  'Under Review': '#f59e0b', 'Pending Docs': '#3b82f6', Approved: '#22c55e', Rejected: '#ef4444',
};

export default function NewAffiliateManagerWorkspace() {
  return (
    <StaffShell
      role="new_affiliate_manager"
      staffName="Kevin Park"
      staffEmail="kevin.park@cryptovault.app"
      managerName="Jessica Liu"
      managerRole="Affiliate Manager"
      managerStatus="online"
      managerId="staff-040"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>New Affiliate Manager</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Onboard new affiliates, review applications, and manage campaigns</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="New Applications" value={4} sub="2 need action" icon={ClipboardList} />
          <KpiCard label="Affiliates Onboarded" value={12} sub="This month" icon={UserPlus} color="#22c55e" />
          <KpiCard label="Active Campaigns" value={7} sub="3 new this week" icon={Megaphone} color="#3b82f6" />
          <KpiCard label="Leads Generated" value="284" sub="+42 this week" icon={TrendingUp} color="#f59e0b" />
        </div>

        {/* Applications Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Affiliate Applications</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>4 pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Company', 'Contact', 'Submitted', 'Source', 'Est. Traffic', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_APPLICATIONS.map(a => (
                  <tr key={a.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{a.name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.contact}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.submitted}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.source}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{a.traffic}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status] }}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Onboarding Pipeline + Campaigns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Onboarding Pipeline</h2>
            <div className="space-y-2">
              {[
                { stage: 'Application Received', count: 4, color: '#3b82f6' },
                { stage: 'Under Review', count: 2, color: '#f59e0b' },
                { stage: 'Docs Requested', count: 1, color: '#8b5cf6' },
                { stage: 'Approved & Active', count: 12, color: '#22c55e' },
              ].map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-xs w-36 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{s.stage}</span>
                  <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded flex items-center px-2" style={{ width: `${Math.min((s.count / 15) * 100, 100)}%`, backgroundColor: s.color }}>
                      <span className="text-xs font-bold text-white">{s.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Active Campaigns</h2>
            <div className="space-y-2">
              {[
                { name: 'Q3 Crypto Launch', affiliates: 4, leads: 142, status: 'Active' },
                { name: 'Summer FTD Push', affiliates: 2, leads: 89, status: 'Active' },
                { name: 'New Market Entry', affiliates: 1, leads: 53, status: 'Paused' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <Megaphone size={13} style={{ color: 'var(--primary)' }} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.affiliates} affiliates · {c.leads} leads</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: c.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: c.status === 'Active' ? '#22c55e' : 'var(--muted-foreground)' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
