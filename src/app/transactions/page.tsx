import { redirect } from 'next/navigation';

export default function TransactionsPage() {
  redirect('/finance?tab=history');
}
