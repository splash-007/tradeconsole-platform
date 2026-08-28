'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Users, ClipboardList, PhoneCall, MessageSquare, Bell,
  Activity, User, TrendingUp, BarChart2, DollarSign, Wallet, ArrowUpDown,
  CreditCard, ShieldCheck, FileText, FolderOpen, Megaphone, BarChart,
  UserPlus, UserCheck, UserCog, Users2, Filter, Clock, List, AlertTriangle,
  LogOut, Sun, Moon, Menu, X, ChevronRight, ChevronDown
} from 'lucide-react';
import type { RoleId, NavItem } from '@/lib/rbac';
import { ROLE_NAV_ITEMS, ROLE_DISPLAY_NAMES, ROLE_DEFAULT_ROUTES } from '@/lib/rbac';
import { staffChatService } from '@/services/staff-chat.service';
import type { PresenceStatus } from '@/services/staff-chat.service';
import StaffChatPanel from '@/components/StaffChatPanel';
import { useAuthGuard, performLogout } from '@/lib/auth-guard';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Users, ClipboardList, PhoneCall, MessageSquare, Bell,
  Activity, User, TrendingUp, BarChart2, DollarSign, Wallet, ArrowUpDown,
  CreditCard, ShieldCheck, FileText, FolderOpen, Megaphone, BarChart,
  UserPlus, UserCheck, UserCog, Users2, Filter, Clock, List, AlertTriangle,
};

interface StaffShellProps {
  role: RoleId;
  staffName?: string;
  staffEmail?: string;
  managerId?: string;
  managerName?: string;
  managerRole?: string;
  managerStatus?: PresenceStatus;
  children: React.ReactNode;
}

const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: '#22c55e',
  away: '#f59e0b',
  busy: '#ef4444',
  offline: '#6b7280',
};

const PRESENCE_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export default function StaffShell({
  role,
  staffName = 'Staff Member',
  staffEmail = '',
  managerId,
  managerName,
  managerRole,
  managerStatus = 'offline',
  children,
}: StaffShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // ── Auth Guard: deny-by-default, any authenticated staff ──────────────────
  const { status: authStatus } = useAuthGuard({ anyAuthenticated: true });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [myPresence, setMyPresence] = useState<PresenceStatus>('online');
  const [unreadChat, setUnreadChat] = useState(0);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const presenceRef = useRef<HTMLDivElement>(null);

  const navItems = ROLE_NAV_ITEMS[role] || [];
  const displayName = ROLE_DISPLAY_NAMES[role] || role;
  const initials = staffName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    staffChatService.getConversations().then(convs => {
      const total = convs.reduce((s, c) => s + c.unreadCount, 0);
      setUnreadChat(total);
    });
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cv-theme') : null;
    const dark = saved !== 'light';
    setIsDark(dark);
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('light', !dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('light', !next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('cv-theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (presenceRef.current && !presenceRef.current.contains(e.target as Node)) setPresenceMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileDrawerOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await performLogout(router);
  };

  const handlePresenceChange = async (status: PresenceStatus) => {
    setMyPresence(status);
    setPresenceMenuOpen(false);
    await staffChatService.updatePresence(status);
  };

  const isActive = (href: string) => {
    const defaultRoute = ROLE_DEFAULT_ROUTES[role];
    if (href === defaultRoute) return pathname === href;
    return pathname.startsWith(href);
  };

  const NavList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
      {navItems.map((item: NavItem) => {
        const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
        const active = isActive(item.href);
        const isMessages = item.label === 'Messages';
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setMobileDrawerOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all hover:bg-white/5 ${(!collapsed || mobile) ? '' : 'justify-center'}`}
            style={{
              color: active ? 'var(--primary)' : 'var(--muted-foreground)',
              backgroundColor: active ? 'rgba(245,196,0,0.08)' : undefined,
            }}
          >
            <IconComp size={14} className="shrink-0" />
            {(!collapsed || mobile) && <span className="flex-1">{item.label}</span>}
            {(!collapsed || mobile) && (item.badge || (isMessages && unreadChat > 0)) && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                {isMessages ? unreadChat : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const ManagerCard = () => (
    <div className="mx-3 mb-3 p-2.5 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(245,196,0,0.04)' }}>
      <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>My Manager</p>
      {managerName ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.2)', color: 'var(--primary)' }}>
            {managerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{managerName}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRESENCE_COLORS[managerStatus] }} />
              <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{managerRole}</span>
            </div>
          </div>
          <Link
            href={`/staff/chat?manager=${managerId}`}
            className="text-xs px-2 py-1 rounded border transition-colors hover:bg-white/5 shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            Msg
          </Link>
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manager not assigned</p>
      )}
    </div>
  );

  const SidebarFooter = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
      {(!collapsed || mobile) && <ManagerCard />}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card" style={{ backgroundColor: PRESENCE_COLORS[myPresence], borderColor: 'var(--card)' }} />
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{staffName}</p>
              <div ref={presenceRef} className="relative">
                <button
                  onClick={() => setPresenceMenuOpen(!presenceMenuOpen)}
                  className="flex items-center gap-1 text-xs hover:opacity-80"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRESENCE_COLORS[myPresence] }} />
                  {PRESENCE_LABELS[myPresence]}
                  <ChevronDown size={9} />
                </button>
                {presenceMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-32 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    {(['online', 'away', 'busy'] as PresenceStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => handlePresenceChange(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                        style={{ color: myPresence === s ? 'var(--primary)' : 'var(--foreground)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRESENCE_COLORS[s] }} />
                        {PRESENCE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {(!collapsed || mobile) && (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:bg-white/5"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={12} /> Logout
          </button>
        )}
      </div>
    </div>
  );

  // Show nothing while auth is being validated (prevents flash of protected content)
  if (authStatus === 'loading' || authStatus === 'unauthenticated' || authStatus === 'forbidden' || authStatus === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${collapsed ? 'w-14' : 'w-52'} shrink-0 border-r flex-col transition-all duration-300`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 px-3 h-12 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <AppLogo size={24} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--primary)' }}>CryonFX</p>
              <p className="text-xs leading-tight truncate" style={{ color: 'var(--muted-foreground)' }}>{displayName}</p>
            </div>
          )}
        </div>
        <NavList />
        <SidebarFooter />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-8 border-t text-xs transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {collapsed ? <ChevronRight size={13} /> : <span className="flex items-center gap-1"><ChevronDown size={13} style={{ transform: 'rotate(90deg)' }} /> Collapse</span>}
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '240px', backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-3 h-12 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <AppLogo size={22} />
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--primary)' }}>CryonFX</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>{displayName}</p>
            </div>
          </div>
          <button onClick={() => setMobileDrawerOpen(false)} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>
        <NavList mobile />
        <SidebarFooter mobile />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <button
            className="lg:hidden p-1.5 rounded hover:bg-white/5 shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <span className="text-xs px-2 py-0.5 rounded font-medium hidden sm:block" style={{ backgroundColor: 'rgba(245,196,0,0.12)', color: 'var(--primary)' }}>
            {displayName}
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Internal Chat — floating panel trigger */}
            <button
              onClick={() => setChatPanelOpen(prev => !prev)}
              className="p-2 rounded hover:bg-white/5 transition-colors relative"
              style={{ color: chatPanelOpen ? 'var(--primary)' : 'var(--muted-foreground)' }}
              title="Internal Chat"
            >
              <MessageSquare size={15} />
              {unreadChat > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>
                  {unreadChat > 9 ? '9+' : unreadChat}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-white/5 transition-colors hidden sm:flex"
              style={{ color: 'var(--muted-foreground)' }}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors hover:bg-white/5"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {initials}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: 'var(--foreground)' }}>{staffName}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{staffName}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{staffEmail}</p>
                    <span className="text-xs" style={{ color: 'var(--primary)' }}>{displayName}</span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/staff/chat"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <MessageSquare size={13} /> Internal Chat
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: '#ef4444' }}
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 md:p-4">
          {children}
        </main>
      </div>

      {/* Floating Chat Panel */}
      {chatPanelOpen && (
        <StaffChatPanel
          mode="floating"
          onClose={() => setChatPanelOpen(false)}
        />
      )}
    </div>
  );
}
