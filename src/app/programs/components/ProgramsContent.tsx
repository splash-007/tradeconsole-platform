'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';


import {
  programsService,
  DepositBonusProgram,
  ReferralProgram,
  ReferralEntry,
  LendingProgram,
  LendingPosition,
} from '@/services/programs.service';

import { Gift, Users, TrendingUp, Award, Copy, Check, ChevronRight, AlertTriangle, Info, ArrowRight, Shield, BarChart2, Lock, ArrowLeft } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';




type ProgramTab = 'overview' | 'deposit-bonus' | 'referral' | 'lending' | 'dividend';

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    available:    { label: 'Available',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    activated:    { label: 'Activated',    color: 'var(--primary)', bg: 'rgba(212,168,0,0.1)' },
    used:         { label: 'Used',         color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    expired:      { label: 'Expired',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    not_eligible: { label: 'Not Eligible', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    active:       { label: 'Active',       color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    pending:      { label: 'Pending',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    qualified:    { label: 'Qualified',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    rewarded:     { label: 'Rewarded',     color: 'var(--primary)', bg: 'rgba(212,168,0,0.1)' },
  };
  const cfg = map[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className={`text-xs font-semibold ${mono ? 'font-mono tabular-nums' : ''}`} style={{ color: 'var(--foreground)' }}>{value}</span>
    </div>
  );
}

// ─── Overview cards ───────────────────────────────────────────────────────────

function OverviewCard({
  icon: Icon,
  title,
  description,
  status,
  accentColor,
  tab,
  onNavigate,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: string;
  accentColor: string;
  tab: ProgramTab;
  onNavigate: (t: ProgramTab) => void;
}) {
  return (
    <button
      onClick={() => onNavigate(tab)}
      className="text-left w-full rounded-xl border p-5 transition-all hover:shadow-md group"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}14`, border: `1px solid ${accentColor}30` }}>
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        <StatusBadge status={status} />
      </div>
      <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>{title}</h3>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      <div className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all" style={{ color: accentColor }}>
        View Program <ArrowRight size={12} />
      </div>
    </button>
  );
}

// ─── Deposit Bonus ────────────────────────────────────────────────────────────

function DepositBonusPanel({ program }: { program: DepositBonusProgram }) {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    await programsService.activateDepositBonus();
    setActivating(false);
    setActivated(true);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Deposit Bonus"
        subtitle="Account credit on qualifying promotional deposits. Program terms are configured by the platform."
      />

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, rgba(212,168,0,0.06) 0%, transparent 60%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,0,0.12)', border: '1px solid rgba(212,168,0,0.25)' }}>
                <Gift size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{program.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Promotional program</p>
              </div>
            </div>
            <StatusBadge status={program.status} />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Bonus Rate</p>
              <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                {program.bonusPercentage !== null ? `${program.bonusPercentage}%` : 'Platform Configured'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Subject to program terms</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Minimum Deposit</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                ${program.minimumDeposit.toLocaleString()}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Qualifying deposit</p>
            </div>
          </div>

          <div className="space-y-0 mb-4">
            <InfoRow label="Maximum Bonus" value={program.maximumBonus !== null ? `$${program.maximumBonus.toLocaleString()}` : 'Platform Configured'} mono />
            <InfoRow label="Eligible Deposit Types" value={program.eligibleDepositTypes.map(t => t.replace('_', ' ')).join(', ')} />
            <InfoRow label="Valid From" value={program.validFrom} />
            <InfoRow label="Valid Until" value={program.validUntil ?? 'Until further notice'} />
            <InfoRow label="Status" value={<StatusBadge status={program.status} />} />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl text-xs mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>{program.terms}</p>
          </div>

          {program.status === 'available' && !activated && (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}
            >
              {activating ? 'Submitting…' : 'Activate Deposit Bonus'}
            </button>
          )}
          {activated && (
            <div className="flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Check size={14} /> Activation request submitted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Referral Program ─────────────────────────────────────────────────────────

function ReferralPanel({ program, history }: { program: ReferralProgram; history: ReferralEntry[] }) {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await programsService.sendReferralInvite(inviteEmail);
    setInviting(false);
    setInvited(true);
    setInviteEmail('');
    setTimeout(() => setInvited(false), 3000);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Referral Program"
        subtitle="Invite clients to Trade Console. Reward amounts are configured by the platform program settings."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Referrals', value: program.totalReferrals, color: 'var(--foreground)' },
          { label: 'Qualified', value: program.qualifiedReferrals, color: '#22c55e' },
          { label: 'Pending Reward', value: program.pendingReward > 0 ? `$${program.pendingReward.toFixed(2)}` : '—', color: '#f59e0b' },
          { label: 'Paid Reward', value: program.paidReward > 0 ? `$${program.paidReward.toFixed(2)}` : '—', color: 'var(--primary)' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Your Referral Details</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Referral Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl border font-mono text-sm font-bold" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                {program.referralCode}
              </div>
              <button
                onClick={() => handleCopy(program.referralCode)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {copied ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Referral Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl border text-xs truncate" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                {program.referralLink}
              </div>
              <button
                onClick={() => handleCopy(program.referralLink)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:bg-muted shrink-0"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <Copy size={12} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Invite a Client</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="client@email.com"
            className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}
          >
            {inviting ? 'Sending…' : invited ? '✓ Sent' : 'Invite'}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>{program.programTerms}</p>
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Referral History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  {['Client', 'Joined', 'Qualified', 'Status', 'Reward', 'Paid'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(entry => (
                  <tr key={entry.id} className="border-t hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{entry.maskedName}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{entry.joinedAt}</td>
                    <td className="px-4 py-2.5">
                      <span style={{ color: entry.qualified ? '#22c55e' : '#f59e0b' }}>{entry.qualified ? 'Yes' : 'Pending'}</span>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={entry.status} /></td>
                    <td className="px-4 py-2.5 tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>{entry.reward !== null ? `$${entry.reward.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{entry.paidAt ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Crypto Lending ───────────────────────────────────────────────────────────

function LendingPanel({ programs, positions }: { programs: LendingProgram[]; positions: LendingPosition[] }) {
  const [selectedProgram, setSelectedProgram] = useState<LendingProgram | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedProgram) return;
    setSubmitting(true);
    await programsService.openLendingPosition(selectedProgram.id, parseFloat(amount));
    setSubmitting(false);
    setSubmitted(true);
    setStep('select');
    setSelectedProgram(null);
    setAmount('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  const riskColor = (level: string) => level === 'low' ? '#22c55e' : level === 'medium' ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Crypto Lending"
        subtitle="Allocate eligible cryptocurrency to approved lending programs. Rates and terms are subject to market conditions and program availability."
      />

      <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
        <p style={{ color: 'var(--muted-foreground)' }}>
          Crypto lending involves risk including potential loss of principal. Rates displayed are indicative and subject to change.
          Past performance does not guarantee future results. Ensure you understand the risks before participating.
        </p>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
          <Check size={13} /> Lending position request submitted. Pending confirmation.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {programs.map(prog => (
          <div
            key={prog.id}
            className="rounded-xl border p-4 transition-all"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: selectedProgram?.id === prog.id ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{prog.assetSymbol}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{prog.asset}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  {prog.apyDisplay ?? 'Rate TBD'}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>APY</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-3 text-xs">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Term</span>
                <span style={{ color: 'var(--foreground)' }}>{prog.term}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Min. Amount</span>
                <span className="tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{prog.minimumAmount} {prog.assetSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Risk Level</span>
                <span className="font-semibold capitalize" style={{ color: riskColor(prog.riskLevel) }}>{prog.riskLevel}</span>
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{prog.description}</p>
            <button
              onClick={() => { setSelectedProgram(prog); setStep('review'); }}
              className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}
            >
              Lend {prog.assetSymbol}
            </button>
          </div>
        ))}
      </div>

      {selectedProgram && step === 'review' && (
        <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Lending Details — {selectedProgram.assetSymbol}</h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({selectedProgram.assetSymbol})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min. ${selectedProgram.minimumAmount}`}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="p-3 rounded-xl text-xs space-y-1.5" style={{ backgroundColor: 'var(--muted)' }}>
              <InfoRow label="Program" value={selectedProgram.name} />
              <InfoRow label="Term" value={selectedProgram.term} />
              <InfoRow label="Rate" value={selectedProgram.apyDisplay ?? 'Provided at confirmation'} />
              <InfoRow label="Risk" value={<span className="capitalize font-semibold" style={{ color: riskColor(selectedProgram.riskLevel) }}>{selectedProgram.riskLevel}</span>} />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Shield size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <p style={{ color: 'var(--muted-foreground)' }}>
                By proceeding you confirm you have read and accepted the lending program risk disclosure and terms.
                Rates are indicative and may change. Principal is not guaranteed.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedProgram(null); setStep('select'); setAmount(''); }}
              className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-muted"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !amount || parseFloat(amount) < selectedProgram.minimumAmount}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}
            >
              {submitting ? 'Submitting…' : 'Confirm Lending'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Active Lending Positions</h3>
        </div>
        {positions.length === 0 ? (
          <div className="py-10 text-center">
            <Lock size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No active lending positions</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>Select a program above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  {['Asset', 'Amount', 'Program', 'Rate', 'Start', 'Maturity', 'Accrued', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-t hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: 'var(--foreground)' }}>{pos.assetSymbol}</td>
                    <td className="px-4 py-2.5 tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{pos.amount}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{pos.program}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--primary)' }}>{pos.rateDisplay ?? '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{pos.startDate}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{pos.maturityDate ?? '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums font-mono" style={{ color: 'var(--positive)' }}>{pos.accruedAmount.toFixed(6)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={pos.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dividend ─────────────────────────────────────────────────────────────────

function DividendPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Dividend Program"
        subtitle="Eligible customers may participate in configured dividend or benefit programs subject to account status and program rules."
      />
      <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,0,0.12)', border: '1px solid rgba(212,168,0,0.25)' }}>
            <Award size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Dividend Program</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Backend-controlled eligibility and amounts</p>
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Dividend eligibility, program participation, claim amounts, and payment schedules are determined by the platform
          based on account status, program rules, and applicable regulations.
        </p>
        <Link
          href="/settings?tab=dividend"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)', color: '#000' }}
        >
          View Dividend Settings <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: ProgramTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart2, desc: 'All programs' },
  { id: 'deposit-bonus', label: 'Deposit Bonus', icon: Gift, desc: 'Promotional credit' },
  { id: 'referral', label: 'Referral Program', icon: Users, desc: 'Invite & earn' },
  { id: 'lending', label: 'Crypto Lending', icon: TrendingUp, desc: 'Earn on assets' },
  { id: 'dividend', label: 'Dividend', icon: Award, desc: 'Eligible payouts' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProgramsContent() {
  const [activeTab, setActiveTab] = useState<ProgramTab>('overview');
  const [depositBonus, setDepositBonus] = useState<DepositBonusProgram | null>(null);
  const [referralProgram, setReferralProgram] = useState<ReferralProgram | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralEntry[]>([]);
  const [lendingPrograms, setLendingPrograms] = useState<LendingProgram[]>([]);
  const [lendingPositions, setLendingPositions] = useState<LendingPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      programsService.getDepositBonus(),
      programsService.getReferralProgram(),
      programsService.getReferralHistory(),
      programsService.getLendingPrograms(),
      programsService.getLendingPositions(),
    ]).then(([db, rp, rh, lp, lpos]) => {
      setDepositBonus(db);
      setReferralProgram(rp);
      setReferralHistory(rh);
      setLendingPrograms(lp);
      setLendingPositions(lpos);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-4 space-y-4">
        <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 rounded-xl border animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-6xl">

      <div className="mb-5">
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Programs &amp; Benefits</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Account programs and financial services available to eligible Trade Console customers.
        </p>
      </div>

      {/* Settings-style two-column layout */}
      <div className="flex gap-5">
        {/* Left sidebar */}
        <div className="hidden lg:block w-52 shrink-0">
          <div className="rounded-xl border overflow-hidden sticky top-16" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b last:border-b-0 transition-colors hover:bg-muted"
                style={{
                  borderColor: 'var(--border)',
                  color: activeTab === item.id ? 'var(--primary)' : 'var(--muted-foreground)',
                  backgroundColor: activeTab === item.id ? 'rgba(212,168,0,0.06)' : 'transparent',
                }}
              >
                <item.icon size={13} />
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link
                href="/settings"
                className="flex items-center gap-2 text-xs transition-colors hover:opacity-80"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <ArrowLeft size={11} />
                Profile &amp; Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="lg:hidden w-full mb-4">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar border-b" style={{ borderColor: 'var(--border)' }}>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0"
                style={{
                  color: activeTab === item.id ? 'var(--primary)' : 'var(--muted-foreground)',
                  borderBottom: activeTab === item.id ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                <item.icon size={12} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OverviewCard
                  icon={Gift}
                  title="Deposit Bonus"
                  description="Receive additional account credit on qualifying promotional deposits. Program terms configured by the platform."
                  status={depositBonus?.status ?? 'available'}
                  accentColor="var(--primary)"
                  tab="deposit-bonus"
                  onNavigate={setActiveTab}
                />
                <OverviewCard
                  icon={Users}
                  title="Referral Program"
                  description="Invite clients to Trade Console. Earn rewards when referred clients qualify under program terms."
                  status={referralProgram?.status ?? 'available'}
                  accentColor="#22c55e"
                  tab="referral"
                  onNavigate={setActiveTab}
                />
                <OverviewCard
                  icon={TrendingUp}
                  title="Crypto Lending"
                  description="Allocate eligible cryptocurrency to approved lending programs. Rates and terms subject to market conditions."
                  status="available"
                  accentColor="#3b82f6"
                  tab="lending"
                  onNavigate={setActiveTab}
                />
                <OverviewCard
                  icon={Award}
                  title="Dividend Program"
                  description="Eligible customers may participate in configured dividend programs subject to account status and program rules."
                  status="available"
                  accentColor="var(--primary)"
                  tab="dividend"
                  onNavigate={setActiveTab}
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
                <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--muted-foreground)' }}>
                  Program availability, eligibility, and terms are subject to jurisdiction, account status, and platform configuration.
                  All financial values are backend-authoritative. The frontend does not modify account balances.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deposit-bonus' && depositBonus && (
            <DepositBonusPanel program={depositBonus} />
          )}

          {activeTab === 'referral' && referralProgram && (
            <ReferralPanel program={referralProgram} history={referralHistory} />
          )}

          {activeTab === 'lending' && (
            <LendingPanel programs={lendingPrograms} positions={lendingPositions} />
          )}

          {activeTab === 'dividend' && (
            <DividendPanel />
          )}
        </div>
      </div>
    </div>
  );
}
