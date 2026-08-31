import type { Metadata } from 'next';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboardContent from '@/app/admin-dashboard/components/AdminDashboardContent';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
