'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Users, ClipboardList, PhoneCall, MessageSquare,
  Bell, Activity, User, ChevronRight, ChevronDown
} from 'lucide-react';

interface AgentLayoutProps { children: React.ReactNode; }

const NAV_ITEMS = [
  { label: 'Overview', href: '/agent', icon: LayoutDashboard },
  { label: 'My Customers', href: '/agent/customers', icon: Users, badge: '24' },
  { label: 'My Tasks', href: '/agent/tasks', icon: ClipboardList, badge: '4' },
  { label: 'Calls', href: '/agent/calls', icon: PhoneCall },
  { label: 'Messages', href: '/agent/messages', icon: MessageSquare, badge: '3' },
  { label: 'Notifications', href: '/agent/notifications', icon: Bell },
  { label: 'Activity', href: '/agent/activity', icon: Activity },
  { label: 'Profile', href: '/agent/profile', icon: User },
];

export default function AgentLayout({ children }: AgentLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/agent') return pathname === '/agent';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-52'} shrink-0 border-r flex flex-col transition-all duration-300`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 px-3 h-12 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <AppLogo size={24} />
          {!collapsed && (
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--primary)' }}>CryptoVault</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>Agent Portal</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: active ? 'rgba(245,196,0,0.08)' : undefined }}>
                <item.icon size={14} className="shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Agent status */}
        {!collapsed && (
          <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>S</div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>Sarah Chen</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-9 border-t text-xs transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          {collapsed ? <ChevronRight size={14} /> : <span className="flex items-center gap-1"><ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} /> Collapse</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b flex items-center px-4 gap-4 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Agent Portal</h1>
          <div className="flex-1" />
          <Link href="/trading-dashboard" className="text-xs px-3 py-1.5 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            ← Back to App
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
