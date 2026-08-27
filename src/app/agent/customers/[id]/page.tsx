import AgentLayout from '@/components/AgentLayout';
import AgentCustomerDetailContent from './components/AgentCustomerDetailContent';
export default async function AgentCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentLayout><AgentCustomerDetailContent customerId={id} /></AgentLayout>;
}
