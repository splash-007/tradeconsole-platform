'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { ShieldCheck, Users, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps { label: string; value: string | number; sub?: string; color?: string; icon: React.ElementType; }
function KpiCard({ label, value, sub, color = 'var(--primary)', icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
    </div>
  );
}

const MOCK_QUEUE = [
  { id: 'kyc-001', customer: 'Thomas Bergmann', type: 'Full KYC', submitted: '2 hrs ago', priority: 'High', status: 'pending' },
  { id: 'kyc-002', customer: 'Priya Sharma', type: 'Address Proof', submitted: '4 hrs ago', priority: 'Medium', status: 'in_review' },
  { id: 'kyc-003', customer: 'Carlos Mendez', type: 'ID Verification', submitted: '1 day ago', priority: 'Low', status: 'pending' },
  { id: 'kyc-004', customer: 'Yuki Tanaka', type: 'Enhanced Due Diligence', submitted: '2 days ago', priority: 'High', status: 'escalated' },
  { id: 'kyc-005', customer: 'Anna Kowalski', type: 'Full KYC', submitted: '3 days ago', priority: 'Medium', status: 'pending' },
];

const MOCK_BROKERS = [
  { name: 'Emma Wilson', cases: 12, approved: 8, rejected: 2, pending: 2, rate: '80%' },
  { name: 'Liam Johnson', cases: 9, approved: 6, rejected: 1, pending: 2, rate: '86%' },
  { name: 'Sofia Garcia', cases: 15, approved: 11, rejected: 3, pending: 1, rate: '79%' },
];

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  in_review: ShieldCheck,
  escalated: AlertTriangle,
  approved: CheckCircle,
  rejected: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_review: '#3b82f6',
  escalated: '#ef4444',
  approved: '#22c55e',
  rejected: '#ef4444',
};

export default function ComplianceManagerWorkspace() {
  return (
    <StaffShell
      role="compliance_manager"
      staffName="Lisa Wang"
      staffEmail="lisa.wang@cryptovault.app"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Compliance Manager</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Verification queue, compliance team, and case management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Pending Cases" value={11} sub="3 high priority" icon={Clock} color="#f59e0b" />
          <KpiCard label="Approved Today" value={8} sub="Avg 2.4 hrs" icon={CheckCircle} color="#22c55e" />
          <KpiCard label="Escalations" value={2} sub="Requires attention" icon={AlertTriangle} color="#ef4444" />
          <KpiCard label="Compliance Team" value={4} sub="All active" icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Verification Queue */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Verification Queue</h2>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>11 pending</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>2 escalated</span>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {MOCK_QUEUE.map(item => {
                const StatusIcon = STATUS_ICONS[item.status];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                    <StatusIcon size={14} style={{ color: STATUS_COLORS[item.status] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{item.customer}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.type} · {item.submitted}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : 'var(--muted-foreground)' }}>
                      {item.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ backgroundColor: `${STATUS_COLORS[item.status]}18`, color: STATUS_COLORS[item.status] }}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <button className="text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Performance */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Compliance Team</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {MOCK_BROKERS.map(b => (
                <div key={b.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{b.name}</p>
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{b.rate}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-1.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.08)' }}>
                      <p className="font-bold" style={{ color: '#22c55e' }}>{b.approved}</p>
                      <p style={{ color: 'var(--muted-foreground)' }}>Approved</p>
                    </div>
                    <div className="text-center p-1.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>
                      <p className="font-bold" style={{ color: '#ef4444' }}>{b.rejected}</p>
                      <p style={{ color: 'var(--muted-foreground)' }}>Rejected</p>
                    </div>
                    <div className="text-center p-1.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.08)' }}>
                      <p className="font-bold" style={{ color: 'var(--primary)' }}>{b.pending}</p>
                      <p style={{ color: 'var(--muted-foreground)' }}>Pending</p>
                    </div>
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
