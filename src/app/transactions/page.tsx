'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import TransactionHistoryContent from './components/TransactionHistoryContent';

export default function TransactionsPage() {
  return (
    <AppLayout>
      <TransactionHistoryContent />
    </AppLayout>
  );
}
