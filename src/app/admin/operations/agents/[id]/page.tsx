import AdminLayout from '@/components/AdminLayout';
import AdminAgentDetailContent from './components/AdminAgentDetailContent';
export default function AdminAgentDetailPage({ params }: { params: { id: string } }) {
  return <AdminLayout><AdminAgentDetailContent agentId={params.id} /></AdminLayout>;
}
