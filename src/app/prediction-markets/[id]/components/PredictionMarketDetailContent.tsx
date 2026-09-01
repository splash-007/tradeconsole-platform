'use client';
import React, { useState, useEffect } from 'react';
import {
  predictionMarketsService,
  PredictionMarket,
  PositionSide,
  EligibilityCheck,
  MarketStatus,
} from '@/services/prediction-markets.service';
import { ArrowLeft, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Loader2, Shield, XCircle, Lock, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Market Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 30) return `${Math.floor(days / 30)} months remaining`;
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function formatVolume(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

function ProbabilityBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--muted)' }}>
      <div className="h-full transition-all" style={{ width: `${yes}%`, backgroundColor: '#22c55e' }} />
      <div className="h-full transition-all" style={{ width: `${no}%`, backgroundColor: '#ef4444' }} />
    </div>
  );
}

// Market status display config
const MARKET_STATUS_CONFIG: Record<MarketStatus, { label: string; color: string; bg: string; icon: React.ElementType; desc: string }> = {
  open: { label: 'Open', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle, desc: 'This market is open for participation.' },
  suspended: { label: 'Suspended', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle, desc: 'This market has been temporarily suspended. No new positions can be opened.' },
  closed: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: XCircle, desc: 'This market is closed. No new positions are accepted.' },
  resolving: { label: 'Resolving', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Loader2, desc: 'This market is currently being resolved. Outcome will be announced shortly.' },
  resolved_yes: { label: 'Resolved — YES', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle, desc: 'This market has resolved YES. Eligible positions are being settled.' },
  resolved_no: { label: 'Resolved — NO', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle, desc: 'This market has resolved NO. Eligible positions are being settled.' },
  voided: { label: 'Voided', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: AlertCircle, desc: 'This market has been voided. All positions will be refunded.' },
};

// Eligibility display config
const ELIGIBILITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; actionLabel?: string; actionHref?: string }> = {
  available: { label: 'Eligible to Participate', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: CheckCircle },
  unavailable: { label: 'Not Available', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: XCircle },
  region_restricted: { label: 'Region Restricted', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: Lock, actionLabel: 'Learn More' },
  kyc_required: { label: 'KYC Required', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Shield, actionLabel: 'Complete Verification', actionHref: '/settings' },
  account_restricted: { label: 'Account Restricted', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle, actionLabel: 'Contact Support', actionHref: '/messages' },
  market_closed: { label: 'Market Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: XCircle },
  resolved: { label: 'Market Resolved', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: CheckCircle },
  voided: { label: 'Market Voided', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: AlertCircle },
};

type ParticipateStep = 'select' | 'amount' | 'review' | 'confirm' | 'done';

export default function PredictionMarketDetailContent({ id }: { id: string }) {
  const [market, setMarket] = useState<PredictionMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [side, setSide] = useState<PositionSide | null>(null);
  const [amount, setAmount] = useState('100');
  const [step, setStep] = useState<ParticipateStep>('select');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    predictionMarketsService.getMarket(id).then(m => {
      setMarket(m);
      setLoading(false);
    });
    predictionMarketsService.checkEligibility(id).then(e => {
      setEligibility(e);
      setEligibilityLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (!market || !side) return;
    setSubmitting(true);
    setStep('confirm');
    await predictionMarketsService.submitPosition(market.id, side, parseFloat(amount));
    setSubmitting(false);
    setStep('done');
  };

  const resetFlow = () => { setSide(null); setAmount('100'); setStep('select'); };

  if (loading) {
    return (
      <div className="py-4 space-y-4">
        <div className="h-6 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Market not found.</p>
        <Link href="/prediction-markets" className="text-xs mt-2 inline-block" style={{ color: 'var(--primary)' }}>← Back to Markets</Link>
      </div>
    );
  }

  const statusCfg = MARKET_STATUS_CONFIG[market.status];
  const isResolved = market.status === 'resolved_yes' || market.status === 'resolved_no';
  const isVoided = market.status === 'voided';
  const canParticipate = eligibility?.canParticipate && market.status === 'open';
  const shares = parseFloat(amount) / (side === 'YES' ? market.yesPrice : market.noPrice || 1);

  return (
    <div className="py-4 space-y-4">
      {/* Back */}
      <Link href="/prediction-markets" className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-foreground" style={{ color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={13} /> Back to Prediction Markets
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-4">
          {/* Hero */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="relative h-40 overflow-hidden">
              <img src={market.imageUrl} alt={market.imageAlt} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))' }} />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}>{market.category}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                    <statusCfg.icon size={10} />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h1 className="text-base font-bold leading-snug" style={{ color: 'var(--foreground)' }}>{market.title}</h1>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{market.description}</p>

              {/* Market status banner for non-open states */}
              {market.status !== 'open' && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}>
                  <statusCfg.icon size={13} style={{ color: statusCfg.color, marginTop: 1 }} />
                  <p className="text-xs" style={{ color: 'var(--foreground)' }}>{statusCfg.desc}</p>
                </div>
              )}

              {/* Probability */}
              <div>
                <ProbabilityBar yes={market.yesProbability} no={market.noProbability} />
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>{market.yesProbability}%</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>YES</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold" style={{ color: '#ef4444' }}>{market.noProbability}%</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>NO</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <TrendingUp size={12} />, label: 'Volume', value: formatVolume(market.volume) },
                  { icon: <Users size={12} />, label: 'Participants', value: market.totalPositions.toLocaleString() },
                  { icon: <Clock size={12} />, label: 'Time Left', value: timeRemaining(market.endsAt) },
                ].map(item => (
                  <div key={item.label} className="rounded p-2.5 text-center" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      {item.icon}
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution Criteria */}
          <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Resolution Criteria</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{market.resolutionCriteria}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Resolution Source</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{market.resolutionSource}</p>
              </div>
              <div className="rounded p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Resolution Deadline</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>
                  {market.resolutionDeadline ? new Date(market.resolutionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Market Rules */}
          <div className="rounded-lg border p-4 space-y-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Info size={14} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Market Rules</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                'Participation uses your available account balance. No additional funds are required.',
                'Settlement is server-authoritative. The frontend never computes or credits balances.',
                'Participation is subject to jurisdiction eligibility and compliance checks.',
                'In the event of a void, all positions will be refunded in full.',
                'Probability percentages are indicative and may change as new positions are opened.',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Recent Activity</h3>
            <div className="space-y-2">
              {market.recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                      {act.user.slice(0, 1)}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{act.user}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: act.side === 'YES' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: act.side === 'YES' ? '#22c55e' : '#ef4444' }}>
                      {act.side}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>${act.amount.toLocaleString()}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Participation Panel */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4 sticky top-16" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Participate</h3>

            {/* Eligibility check */}
            {eligibilityLoading ? (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <Loader2 size={13} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Checking eligibility…</span>
              </div>
            ) : eligibility && !eligibility.canParticipate ? (
              /* Ineligible state */
              <div className="space-y-3">
                {(() => {
                  const cfg = ELIGIBILITY_CONFIG[eligibility.status] || ELIGIBILITY_CONFIG.unavailable;
                  return (
                    <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <div className="flex items-center gap-2">
                        <cfg.icon size={14} style={{ color: cfg.color }} />
                        <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{eligibility.message}</p>
                      {cfg.actionLabel && cfg.actionHref && (
                        <Link
                          href={cfg.actionHref}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition-all hover:opacity-90"
                          style={{ backgroundColor: cfg.color, color: '#fff' }}
                        >
                          {cfg.actionLabel}
                        </Link>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-start gap-2 p-2.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)' }}>
                  <AlertTriangle size={11} style={{ color: 'var(--primary)', marginTop: 1 }} />
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    Eligibility is determined by the platform based on your account status, jurisdiction, and compliance requirements.
                  </p>
                </div>
              </div>
            ) : !canParticipate && market.status !== 'open' ? (
              /* Market not open */
              <div className="p-3 rounded-lg" style={{ backgroundColor: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}>
                <div className="flex items-center gap-2 mb-1">
                  <statusCfg.icon size={13} style={{ color: statusCfg.color }} />
                  <p className="text-xs font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{statusCfg.desc}</p>
              </div>
            ) : step === 'done' ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle size={28} style={{ color: '#22c55e' }} />
                <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Position submitted</p>
                <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                  Your {side} position of ${amount} has been submitted. Settlement is server-authoritative.
                </p>
                <button onClick={resetFlow} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                  New Position
                </button>
              </div>
            ) : (
              <>
                {/* Eligible badge */}
                {eligibility && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle size={11} style={{ color: '#22c55e' }} />
                    <span style={{ color: '#22c55e' }}>Eligible to participate</span>
                  </div>
                )}

                {/* Step 1: Select side */}
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Select outcome</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSide('YES'); setStep('amount'); }}
                      className="py-3 rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor: side === 'YES' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)',
                        color: '#22c55e',
                        border: `2px solid ${side === 'YES' ? '#22c55e' : 'rgba(34,197,94,0.25)'}`,
                      }}
                    >
                      YES
                      <p className="text-xs font-normal mt-0.5">${market.yesPrice.toFixed(2)} / share</p>
                    </button>
                    <button
                      onClick={() => { setSide('NO'); setStep('amount'); }}
                      className="py-3 rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor: side === 'NO' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)',
                        color: '#ef4444',
                        border: `2px solid ${side === 'NO' ? '#ef4444' : 'rgba(239,68,68,0.2)'}`,
                      }}
                    >
                      NO
                      <p className="text-xs font-normal mt-0.5">${market.noPrice.toFixed(2)} / share</p>
                    </button>
                  </div>
                </div>

                {/* Step 2: Amount */}
                {step !== 'select' && side && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Allocation amount (USDT)</p>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min={1}
                      className="w-full px-3 py-2 rounded-md text-sm border focus:outline-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <div className="flex gap-1">
                      {['50', '100', '250', '500'].map(v => (
                        <button key={v} onClick={() => setAmount(v)} className="flex-1 py-1 rounded text-xs font-medium transition-all" style={{ backgroundColor: amount === v ? 'rgba(245,196,0,0.15)' : 'var(--muted)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', border: `1px solid ${amount === v ? 'rgba(245,196,0,0.3)' : 'var(--border)'}` }}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step !== 'select' && side && parseFloat(amount) > 0 && (
                  <div className="rounded-lg p-3 space-y-1.5" style={{ backgroundColor: 'var(--muted)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Order Summary</p>
                    {[
                      ['Outcome', side],
                      ['Amount', `$${parseFloat(amount).toLocaleString()} USDT`],
                      ['Price per share', `$${(side === 'YES' ? market.yesPrice : market.noPrice).toFixed(2)}`],
                      ['Estimated shares', `${shares.toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                        <span className="text-xs font-semibold" style={{ color: k === 'Outcome' ? (side === 'YES' ? '#22c55e' : '#ef4444') : 'var(--foreground)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-2.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)' }}>
                  <AlertTriangle size={11} style={{ color: 'var(--primary)', marginTop: 1 }} />
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    Participation uses your account balance. Settlement is server-authoritative. Subject to jurisdiction eligibility checks.
                  </p>
                </div>

                {/* Submit */}
                {step !== 'select' && side && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !parseFloat(amount)}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: side === 'YES' ? '#22c55e' : '#ef4444', color: '#fff' }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {submitting ? 'Submitting…' : `Confirm ${side} — $${amount}`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Market stats */}
          <div className="rounded-lg border p-4 space-y-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>MARKET STATISTICS</p>
            {[
              { label: 'Total Volume', value: formatVolume(market.volume) },
              { label: 'Total Participants', value: market.totalPositions.toLocaleString() },
              { label: 'YES Price', value: `$${market.yesPrice.toFixed(3)}` },
              { label: 'NO Price', value: `$${market.noPrice.toFixed(3)}` },
              { label: 'Market Status', value: MARKET_STATUS_CONFIG[market.status].label },
              { label: 'Closes', value: new Date(market.endsAt).toLocaleDateString() },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
