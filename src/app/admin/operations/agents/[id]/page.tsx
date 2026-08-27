import AdminLayout from '@/components/AdminLayout';
import AdminAgentDetailContent from './components/AdminAgentDetailContent';
export default async function AdminAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminLayout><AdminAgentDetailContent agentId={id} /></AdminLayout>;
}
