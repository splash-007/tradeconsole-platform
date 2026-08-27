'use client';
import React from 'react';
import { PageHeader, Card, KpiCard } from '@/components/admin/AdminUI';

const FUNNEL_STEPS = [
  { step: 'Landing Page Visit', count: 48200, pct: 100, color: '#F5C400' },
  { step: 'Registration Started', count: 18400, pct: 38.2, color: '#e6b800' },
  { step: 'Registration Completed', count: 14820, pct: 30.7, color: '#d4a800' },
  { step: 'Email Verified', count: 11240, pct: 23.3, color: '#c29800' },
  { step: 'KYC Submitted', count: 8940, pct: 18.5, color: '#b08800' },
  { step: 'KYC Approved', count: 6820, pct: 14.1, color: '#9e7800' },
  { step: 'First Deposit', count: 3218, pct: 6.7, color: '#8c6800' },
  { step: 'First Trade', count: 2140, pct: 4.4, color: '#7a5800' },
];

export default function AdminFunnelContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Conversion Funnel" subtitle="Customer journey from landing to first trade" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Visitors" value="48,200" />
        <KpiCard label="Registrations" value="14,820" sub="30.7% of visitors" />
        <KpiCard label="KYC Approved" value="6,820" sub="14.1% of visitors" />
        <KpiCard label="First Deposit" value="3,218" sub="6.7% of visitors" />
      </div>
      <Card>
        <h3 className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Conversion Funnel</h3>
        <div className="space-y-3">
          {FUNNEL_STEPS?.map((step, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>{step?.step}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{step?.count?.toLocaleString()}</span>
                  <span className="text-xs font-bold w-12 text-right" style={{ color: step?.color }}>{step?.pct}%</span>
                </div>
              </div>
              <div className="h-6 rounded overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <div className="h-full rounded flex items-center px-2 transition-all duration-500"
                  style={{ width: `${step?.pct}%`, backgroundColor: step?.color, minWidth: 40 }}>
                  <span className="text-xs font-bold" style={{ color: '#000' }}>{step?.pct}%</span>
                </div>
              </div>
              {i < FUNNEL_STEPS?.length - 1 && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Drop-off: {(FUNNEL_STEPS?.[i]?.count - FUNNEL_STEPS?.[i + 1]?.count)?.toLocaleString()} ({(100 - (FUNNEL_STEPS?.[i + 1]?.count / FUNNEL_STEPS?.[i]?.count * 100))?.toFixed(1)}%)
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
