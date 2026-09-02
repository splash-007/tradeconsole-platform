'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import SettingsContent from './components/SettingsContent';

const VALID_TABS = [
  'overview', 'personal', 'account', 'kyc', 'security',
  'preferences', 'notifications', 'documents', 'sessions', 'dividend',
];

function SettingsWithParams() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') ?? 'overview';
  const resolvedTab = VALID_TABS?.includes(tab) ? tab : 'overview';
  return <SettingsContent initialTab={resolvedTab} />;
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SettingsContent initialTab="overview" />}>
        <SettingsWithParams />
      </Suspense>
    </AppLayout>
  );
}
