import type { Metadata } from 'next';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboardContent from './components/AdminDashboardContent';

// Private page — must not be indexed by search engines
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}