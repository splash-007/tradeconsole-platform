import AgentLayout from '@/components/AgentLayout';
import AgentCustomerDetailContent from './components/AgentCustomerDetailContent';

export const dynamic = 'force-dynamic';

export default async function AgentCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentLayout><AgentCustomerDetailContent customerId={id} /></AgentLayout>;
}
