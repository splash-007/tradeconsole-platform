'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KYCVerificationFlow from '@/components/kyc/KYCVerificationFlow';
import { Shield, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    router?.push('/trading-dashboard');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.12)', border: '1px solid rgba(245,196,0,0.2)' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Identity Verification (KYC)</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Complete your identity verification to unlock full trading features. Your submission will be reviewed by our compliance team.
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Lock size={13} className="mt-0.5 shrink-0" style={{ color: '#3b82f6' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Your data is encrypted and stored securely. KYC is required by financial regulations and helps protect your account. Once approved by an authorised compliance officer, your account will be fully activated.
          </p>
        </div>

        {/* KYC Flow */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
          <KYCVerificationFlow onComplete={handleComplete} isFirstLogin={true} />
        </div>
      </div>
    </AppLayout>
  );
}
