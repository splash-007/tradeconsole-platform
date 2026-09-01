'use client';
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminAccountRequestsContent from './components/AdminAccountRequestsContent';

export default function AdminAccountRequestsPage() {
  return (
    <AdminLayout>
      <AdminAccountRequestsContent />
    </AdminLayout>
  );
}
