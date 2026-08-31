import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';
import DashboardContent from '@/app/trading-dashboard/components/DashboardContent';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function TradingDashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
