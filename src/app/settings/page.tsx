'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import SettingsContent from './components/SettingsContent';

function SettingsWithParams() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');
  return <SettingsContent initialTab={tab === 'kyc' ? 'kyc' : undefined} />;
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SettingsContent initialTab={undefined} />}>
        <SettingsWithParams />
      </Suspense>
    </AppLayout>
  );
}
