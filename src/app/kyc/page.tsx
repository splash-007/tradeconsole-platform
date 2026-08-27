'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KYCVerificationFlow from '@/components/kyc/KYCVerificationFlow';
import { Shield } from 'lucide-react';

export default function KYCPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Identity Verification</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Complete KYC to unlock full trading features</p>
          </div>
        </div>
        <KYCVerificationFlow />
      </div>
    </AppLayout>
  );
}
