'use client';
import React, { useState } from 'react';
import StaffShell from '@/components/StaffShell';
import { ShieldCheck, FileText, FolderOpen, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
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

const MOCK_CASES = [
  { id: 'k1', name: 'Elena Vasquez', type: 'KYC Review', submitted: '2 hrs ago', risk: 'Low', status: 'Pending', docs: 3 },
  { id: 'k2', name: 'Omar Hassan', type: 'Document Verification', submitted: '4 hrs ago', risk: 'Medium', status: 'In Review', docs: 2 },
  { id: 'k3', name: 'Natasha Ivanova', type: 'AML Check', submitted: '1 day ago', risk: 'High', status: 'Escalated', docs: 4 },
  { id: 'k4', name: 'Wei Zhang', type: 'KYC Review', submitted: '2 days ago', risk: 'Low', status: 'Approved', docs: 3 },
  { id: 'k5', name: 'Sofia Rossi', type: 'Identity Verification', submitted: '3 hrs ago', risk: 'Low', status: 'Pending', docs: 2 },
];

const RISK_COLORS: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { Pending: '#f59e0b', 'In Review': '#3b82f6', Escalated: '#ef4444', Approved: '#22c55e', Rejected: '#ef4444' };

export default function ComplianceBrokerWorkspace() {
  const [activeTab, setActiveTab] = useState<'cases' | 'kyc' | 'documents'>('cases');

  return (
    <StaffShell
      role="compliance_broker"
      staffName="Lisa Wang"
      staffEmail="lisa.wang@cryptovault.app"
      managerName="Robert Chen"
      managerRole="Compliance Manager"
      managerStatus="busy"
      managerId="staff-030"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Compliance Broker Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>KYC verification, document review, and compliance case management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Open Cases" value={7} sub="2 escalated" icon={ShieldCheck} />
          <KpiCard label="KYC Queue" value={5} sub="3 pending review" icon={FileText} color="#f59e0b" />
          <KpiCard label="Approved Today" value={4} sub="avg 2.1 hrs" icon={CheckCircle} color="#22c55e" />
          <KpiCard label="Avg Review Time" value="2.4h" sub="-0.3h vs target" icon={Clock} color="#3b82f6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {(['cases', 'kyc', 'documents'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded text-xs font-medium capitalize transition-all"
              style={{
                backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--muted-foreground)',
              }}
            >
              {tab === 'kyc' ? 'KYC Queue' : tab === 'cases' ? 'Cases' : 'Documents'}
            </button>
          ))}
        </div>

        {/* Cases Table */}
        {activeTab === 'cases' && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Compliance Cases</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>7 open</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Case Type', 'Submitted', 'Risk', 'Docs', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CASES.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.type}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{c.submitted}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium" style={{ color: RISK_COLORS[c.risk] }}>{c.risk}</span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>{c.docs} files</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          <Eye size={11} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>KYC Verification Queue</h2>
            <div className="space-y-2">
              {MOCK_CASES.filter(c => c.status === 'Pending' || c.status === 'In Review').map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.type} · {c.docs} documents · {c.submitted}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: RISK_COLORS[c.risk] }}>{c.risk} Risk</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="p-1.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}><CheckCircle size={13} /></button>
                    <button className="p-1.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><XCircle size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Document Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Passport — Elena Vasquez', type: 'Identity', uploaded: '2 hrs ago', status: 'Pending' },
                { name: 'Bank Statement — Omar Hassan', type: 'Financial', uploaded: '4 hrs ago', status: 'In Review' },
                { name: 'Utility Bill — Natasha Ivanova', type: 'Address', uploaded: '1 day ago', status: 'Escalated' },
                { name: 'Driving License — Sofia Rossi', type: 'Identity', uploaded: '3 hrs ago', status: 'Pending' },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
                  <FolderOpen size={16} style={{ color: 'var(--primary)' }} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{d.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.type} · {d.uploaded}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: `${STATUS_COLORS[d.status]}18`, color: STATUS_COLORS[d.status] }}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
