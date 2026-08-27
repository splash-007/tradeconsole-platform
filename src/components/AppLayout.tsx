import React from 'react';
import TopNav from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <TopNav />
      <main className={`flex-1 ${fullWidth ? '' : 'max-w-screen-2xl mx-auto w-full px-3 sm:px-4 xl:px-6 2xl:px-8'}`}>
        {children}
      </main>
    </div>
  );
}