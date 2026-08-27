'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DepositWithdrawFlow from '@/components/finance/DepositWithdrawFlow';

import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

type ActiveFlow = 'deposit' | 'withdrawal' | null;

export default function FinancePage() {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);

  if (activeFlow) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto p-4">
          <DepositWithdrawFlow
            type={activeFlow}
            onClose={() => setActiveFlow(null)}
            availableBalance={24850}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
            <Wallet size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Funds</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Deposit and withdraw from your account</p>
          </div>
        </div>

        {/* Balance card */}
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Available Balance</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>$24,850.00</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Reserved: $5,000.00 · Total: $29,850.00</p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveFlow('deposit')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:border-green-500/50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <ArrowDownLeft size={18} style={{ color: '#22c55e' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Deposit</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Add funds to your account</span>
          </button>

          <button
            onClick={() => setActiveFlow('withdrawal')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:border-red-500/50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
              <ArrowUpRight size={18} style={{ color: '#ef4444' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Withdraw</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Transfer funds out</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
