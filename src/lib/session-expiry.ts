/**
 * CryonFX — Session Expiry Handler
 *
 * Monitors session validity and handles expiry gracefully:
 * - Polls session validity periodically
 * - Shows expiry notification before redirecting
 * - Clears all private state on expiry
 * - Handles multi-tab logout detection
 */

'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/session';
import { clearSessionCookies } from '@/lib/auth-guard';

const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds
const SESSION_EXPIRY_DURATION = 8 * 60 * 60 * 1000; // 8 hours

interface SessionExpiryHandlerProps {
  /** Called when session expires — use to clear component-level state */
  onExpiry?: () => void;
}

export function useSessionExpiryHandler({ onExpiry }: SessionExpiryHandlerProps = {}) {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const checkSession = () => {
      try {
        // Check if session still exists in sessionStorage
        const session = getSession();
        if (!session) {
          handleExpiry();
          return;
        }

        // Check if session cookie marker is still present
        if (typeof document !== 'undefined') {
          const hasCookie = document.cookie.includes('cv_session_present=1');
          if (!hasCookie) {
            handleExpiry();
            return;
          }
        }
      } catch {
        // FAIL CLOSED
        handleExpiry();
      }
    };

    const handleExpiry = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Clear all private state
      clearSession();
      clearSessionCookies();

      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('cv-') || key.startsWith('cv_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      onExpiry?.();
      setSessionExpired(true);

      // Redirect after brief delay to show expiry message
      setTimeout(() => {
        router.replace('/secure-login?reason=expired');
      }, 2000);
    };

    // Listen for storage events (multi-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cv_session' && e.newValue === null) {
        // Session was cleared in another tab
        handleExpiry();
      }
    };

    // Start periodic check
    intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Listen for cross-tab logout
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [router, onExpiry]);

  return { sessionExpired };
}

/**
 * Session expiry overlay — shown briefly before redirecting to login.
 */
export function SessionExpiryOverlay() {
  const { sessionExpired } = useSessionExpiryHandler();

  if (!sessionExpired) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <div
        className="rounded-2xl border p-8 text-center max-w-sm mx-4"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(245,196,0,0.1)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-base font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Session Expired
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Your session has expired. Please sign in again.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      </div>
    </div>
  );
}
