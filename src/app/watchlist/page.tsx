import React from 'react';
import AppLayout from '@/components/AppLayout';
import WatchlistContent from './components/WatchlistContent';

export const metadata = {
  title: 'Watchlist — CryonFX',
  robots: { index: false, follow: false },
};

export default function WatchlistPage() {
  return (
    <AppLayout>
      <WatchlistContent />
    </AppLayout>
  );
}
