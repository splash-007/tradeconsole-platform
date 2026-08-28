'use client';
import React from 'react';
import StaffShell from '@/components/StaffShell';
import { Wallet, ArrowUpDown, CreditCard, TrendingUp } from 'lucide-react';
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

const MOCK_DEPOSITS = [
  { id: 'd1', customer: 'Alex Morgan', amount: '$10,000', method: 'Bank Transfer', status: 'pending', submitted: '09:00' },
  { id: 'd2', customer: 'Marcus Whitfield', amount: '$5,000', method: 'Credit Card', status: 'approved', submitted: '10:30' },
  { id: 'd3', customer: 'Priya Sharma', amount: '$2,000', method: 'Crypto', status: 'processing', submitted: '11:15' },
  { id: 'd4', customer: 'Aisha Al-Rashidi', amount: '$50,000', method: 'Bank Transfer', status: 'pending', submitted: '12:00' },
];

const MOCK_WITHDRAWALS = [
  { id: 'w1', customer: 'Aisha Al-Rashidi', amount: '$8,000', method: 'Bank Transfer', status: 'pending', destination: 'IBAN ...4521' },
  { id: 'w2', customer: 'Alex Morgan', amount: '$2,500', method: 'Crypto', status: 'approved', destination: 'BTC ...8f2a' },
];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(245,196,0,0.1)', color: 'var(--primary)' },
  approved: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export default function FinanceWorkspace() {
  return (
    <StaffShell
      role="finance"
      staffName="David Kim"
      staffEmail="david.kim@cryptovault.app"
    >
      <div className="space-y-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Finance Workspace</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Accounts, transactions, deposits, and withdrawals</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Total AUM" value="$2.4M" sub="Across all accounts" icon={Wallet} />
          <KpiCard label="Pending Deposits" value={3} sub="Requires review" icon={CreditCard} color="#f59e0b" />
          <KpiCard label="Pending Withdrawals" value={1} sub="Requires approval" icon={ArrowUpDown} color="#ef4444" />
          <KpiCard label="Today's Volume" value="$67,500" sub="+12% vs yesterday" icon={TrendingUp} color="#22c55e" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending Deposits */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Deposit Queue</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>3 pending</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {MOCK_DEPOSITS.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{d.customer}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.method} · {d.submitted}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{d.amount}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={STATUS_STYLES[d.status]}>
                    {d.status}
                  </span>
                  {d.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>✓</button>
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✗</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Withdrawal Queue</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>1 pending</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {MOCK_WITHDRAWALS.map(w => (
                <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{w.customer}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{w.destination}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#ef4444' }}>{w.amount}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={STATUS_STYLES[w.status]}>
                    {w.status}
                  </span>
                  {w.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>✓</button>
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✗</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reconciliation Summary */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Daily Reconciliation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Opening Balance', value: '$2,310,000', icon: Wallet, color: 'var(--foreground)' },
              { label: 'Total Deposits', value: '+$67,000', icon: CreditCard, color: '#22c55e' },
              { label: 'Total Withdrawals', value: '-$10,500', icon: ArrowUpDown, color: '#ef4444' },
              { label: 'Closing Balance', value: '$2,366,500', icon: TrendingUp, color: 'var(--primary)' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <item.icon size={12} style={{ color: item.color }} />
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                </div>
                <p className="text-base font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
