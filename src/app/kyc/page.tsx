'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

// KYC has been moved into Profile & Settings → Identity Verification
// This page redirects to the new location to preserve any existing links
export default function KYCPage() {
  const router = useRouter();

  useEffect(() => {
    router?.replace('/settings?tab=kyc');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Redirecting to Identity Verification…</p>
        </div>
      </div>
    </AppLayout>
  );
}
