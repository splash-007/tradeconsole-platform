import AppLayout from '@/components/AppLayout';
import PredictionMarketDetailContent from './components/PredictionMarketDetailContent';

export default function PredictionMarketDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <PredictionMarketDetailContent id={params.id} />
    </AppLayout>
  );
}
