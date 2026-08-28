'use client';
import React from 'react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Access Denied
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
          403 — You do not have permission to access this page.
        </p>
        <p className="text-xs mb-8" style={{ color: 'var(--muted-foreground)' }}>
          If you believe this is an error, please contact your administrator.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/secure-login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}
          >
            Sign In
          </Link>
          <button
            onClick={() => window.history?.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
