import AgentLayout from '@/components/AgentLayout';
import AgentCustomerDetailContent from './components/AgentCustomerDetailContent';
export default function AgentCustomerDetailPage({ params }: { params: { id: string } }) {
  return <AgentLayout><AgentCustomerDetailContent customerId={params.id} /></AgentLayout>;
}
