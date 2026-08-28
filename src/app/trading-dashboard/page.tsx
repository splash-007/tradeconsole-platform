import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';
import DashboardContent from './components/DashboardContent';

// Private page — must not be indexed by search engines
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TradingDashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}