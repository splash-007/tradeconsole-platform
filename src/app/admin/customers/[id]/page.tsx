import AdminLayout from '@/components/AdminLayout';
import AdminCustomerDetailContent from './components/AdminCustomerDetailContent';

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <AdminCustomerDetailContent customerId={params.id} />
    </AdminLayout>
  );
}
