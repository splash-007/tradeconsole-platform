import { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import TradingWorkspace from './components/TradingWorkspace';

export default function TradingWorkspacePage() {
  return (
    <AppLayout fullWidth>
      <Suspense fallback={null}>
        <TradingWorkspace />
      </Suspense>
    </AppLayout>
  );
}