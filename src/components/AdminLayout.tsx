'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Users, Megaphone, Wallet, ArrowUpDown, ShieldCheck, HeadphonesIcon, Bell, UserCog, KeyRound, ScrollText, Settings, ChevronDown, ChevronRight, TrendingUp, Globe, Tag, BarChart2, Filter, ClipboardList, UserCheck, MessageSquare, Ticket, BarChart, Activity, BookOpen, Briefcase, FileText, DollarSign, CreditCard, Shield, Cpu, Users2, Beaker, LogOut, User, Sun, Moon, UserPlus } from 'lucide-react';

interface AdminLayoutProps { children: React.ReactNode; }

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group: string;
  badge?: string;
  children?: { label: string; href: string; icon: React.ElementType }[];
}

const SIDEBAR_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/admin-dashboard', icon: LayoutDashboard, group: 'main' },

  { label: 'Registrations', href: '/admin/registrations', icon: Users, group: 'customers', badge: '84' },
  { label: 'Customers', href: '/admin/customers', icon: UserCog, group: 'customers' },

  {
    label: 'Marketing', href: '#', icon: Megaphone, group: 'marketing', children: [
      { label: 'Marketing Overview', href: '/admin/marketing', icon: BarChart2 },
      { label: 'Sources', href: '/admin/marketing/sources', icon: Globe },
      { label: 'Affiliates', href: '/admin/marketing/affiliates', icon: Tag },
      { label: 'Campaigns', href: '/admin/marketing/campaigns', icon: TrendingUp },
      { label: 'UTM Analytics', href: '/admin/marketing/utm', icon: BarChart },
      { label: 'Conversion Funnel', href: '/admin/marketing/funnel', icon: Filter },
    ]
  },

  {
    label: 'Operations', href: '#', icon: Briefcase, group: 'operations', children: [
      { label: 'Assignments', href: '/admin/operations/assignments', icon: UserCheck },
      { label: 'Agents', href: '/admin/operations/agents', icon: Users2 },
      { label: 'Tasks', href: '/admin/operations/tasks', icon: ClipboardList },
      { label: 'Communications', href: '/admin/operations/communications', icon: MessageSquare },
    ]
  },

  {
    label: 'Finance', href: '#', icon: DollarSign, group: 'finance', children: [
      { label: 'Accounts', href: '/admin/finance/accounts', icon: Wallet },
      { label: 'Transactions', href: '/admin/finance/transactions', icon: ArrowUpDown },
      { label: 'Deposits', href: '/admin/finance/deposits', icon: CreditCard },
      { label: 'Withdrawals', href: '/admin/finance/withdrawals', icon: ArrowUpDown },
    ]
  },

  {
    label: 'Trading', href: '#', icon: Activity, group: 'trading', children: [
      { label: 'Market Overview', href: '/admin/trading/market', icon: BarChart2 },
      { label: 'Orders', href: '/admin/trading/orders', icon: BookOpen },
      { label: 'Positions', href: '/admin/trading/positions', icon: TrendingUp },
      { label: 'Trading Activity', href: '/admin/trading/activity', icon: Activity },
    ]
  },

  {
    label: 'Compliance', href: '#', icon: ShieldCheck, group: 'compliance', children: [
      { label: 'Verification', href: '/admin/compliance/verification', icon: Shield },
      { label: 'Documents', href: '/admin/compliance/documents', icon: FileText },
    ]
  },

  {
    label: 'Support', href: '#', icon: HeadphonesIcon, group: 'support', children: [
      { label: 'Conversations', href: '/admin/support/conversations', icon: MessageSquare },
      { label: 'Tickets', href: '/admin/support/tickets', icon: Ticket },
    ]
  },

  {
    label: 'System', href: '#', icon: Cpu, group: 'system', children: [
      { label: 'Notifications', href: '/admin/system/notifications', icon: Bell },
      { label: 'Staff', href: '/admin/system/staff', icon: Users },
      { label: 'Roles & Permissions', href: '/admin/system/roles', icon: KeyRound },
      { label: 'Audit Logs', href: '/admin/system/audit', icon: ScrollText },
      { label: 'Settings', href: '/admin/system/settings', icon: Settings },
      { label: 'Simulation Lab', href: '/admin/system/simulation', icon: Beaker },
    ]
  },
];

const GROUP_LABELS: Record<string, string> = {
  main: '',
  customers: 'Customers',
  marketing: 'Marketing',
  operations: 'Operations',
  finance: 'Finance',
  trading: 'Trading',
  compliance: 'Compliance',
  support: 'Support',
  system: 'System',
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['marketing', 'operations', 'finance', 'trading', 'compliance', 'support', 'system']);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  interface AdminNotification {
    id: string;
    type: 'lead' | 'registration' | 'deposit' | 'kyc' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
  }

  const [adminNotifs, setAdminNotifs] = useState<AdminNotification[]>([
    { id: 'an-001', type: 'lead', title: 'New Lead Arrived', message: 'Thomas Bergmann registered from Germany via Google Ads campaign', time: '1 min ago', read: false },
    { id: 'an-002', type: 'lead', title: 'New Lead Arrived', message: 'Priya Sharma registered from India via Organic Search', time: '5 min ago', read: false },
    { id: 'an-003', type: 'registration', title: 'Registration Spike', message: '12 new registrations in the last hour — 40% above average', time: '15 min ago', read: false },
    { id: 'an-004', type: 'deposit', title: 'Large Deposit Pending', message: '$50,000 deposit from Alex Morgan requires manual review', time: '30 min ago', read: false },
    { id: 'an-005', type: 'kyc', title: 'KYC Documents Submitted', message: 'Maria Garcia submitted KYC documents for review', time: '1 hr ago', read: true },
    { id: 'an-006', type: 'system', title: 'System Alert', message: 'Unusual trading activity detected on account #CV-4821', time: '2 hrs ago', read: true },
  ]);

  const unreadCount = adminNotifs.filter(n => !n.read).length;

  const NOTIF_COLORS: Record<string, string> = {
    lead: '#F5C400', registration: '#22c55e', deposit: '#3b82f6', kyc: '#f59e0b', system: '#ef4444'
  };

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cv-theme') : null;
    const dark = saved !== 'light';
    setIsDark(dark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', !dark);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', !next);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cv-theme', next ? 'dark' : 'light');
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    router.push('/sign-up-login-screen');
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  const groups = Array.from(new Set(SIDEBAR_ITEMS.map(i => i.group)));

  const isActiveItem = (href: string) => {
    if (href === '#') return false;
    if (href === '/admin-dashboard') return pathname === '/admin-dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-56'} shrink-0 border-r flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 h-12 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <AppLogo size={26} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--primary)' }}>CryptoVault</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
          {groups.map(group => {
            const items = SIDEBAR_ITEMS.filter(i => i.group === group);
            const groupLabel = GROUP_LABELS[group];
            return (
              <div key={`admin-group-${group}`} className="mb-1">
                {groupLabel && !collapsed && (
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                    {groupLabel}
                  </p>
                )}
                {items.map(item => {
                  const isActive = isActiveItem(item.href);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedGroups.includes(item.label);
                  const anyChildActive = hasChildren && item.children!.some(c => isActiveItem(c.href));

                  return (
                    <div key={`admin-nav-${item.label}`}>
                      {hasChildren ? (
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                          style={{ color: anyChildActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                        >
                          <item.icon size={14} className="shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                          style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: isActive ? 'rgba(245,196,0,0.08)' : undefined }}
                        >
                          <item.icon size={14} className="shrink-0" />
                          {!collapsed && <span className="flex-1">{item.label}</span>}
                          {!collapsed && item.badge && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}
                      {hasChildren && isExpanded && !collapsed && (
                        <div className="ml-5 border-l pl-2 my-0.5" style={{ borderColor: 'var(--border)' }}>
                          {item.children!.map(child => {
                            const childActive = isActiveItem(child.href);
                            return (
                              <Link
                                key={`admin-child-${child.label}`}
                                href={child.href}
                                className="flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-all hover:bg-white/5"
                                style={{ color: childActive ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: childActive ? 'rgba(245,196,0,0.08)' : undefined }}
                              >
                                <child.icon size={12} />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-9 border-t text-xs transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <span className="flex items-center gap-1"><ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} /> Collapse</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin topbar */}
        <header className="h-12 border-b flex items-center px-4 gap-4 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Admin Panel</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded hover:bg-white/5 transition-colors relative"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</p>
                      {unreadCount > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={() => setAdminNotifs(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs" style={{ color: 'var(--primary)' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {adminNotifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => setAdminNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer hover:bg-white/3 transition-colors"
                        style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${NOTIF_COLORS[n.type]}18` }}>
                          {n.type === 'lead' ? <UserPlus size={12} style={{ color: NOTIF_COLORS[n.type] }} /> : <Bell size={12} style={{ color: NOTIF_COLORS[n.type] }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary)' }} />}
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                          <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Link href="/admin/registrations" onClick={() => setNotifOpen(false)} className="block w-full text-xs text-center py-1" style={{ color: 'var(--primary)' }}>
                      View all leads →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Day/Night Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-white/5 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors hover:bg-white/5"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>S</div>
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>Sarah Chen</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>super_admin</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Sarah Chen</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>sarah.chen@cryptovault.app</p>
                  </div>
                  <div className="py-1">
                    <Link href="/admin/system/settings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: 'var(--foreground)' }}>
                      <User size={13} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: '#ef4444' }}>
                      <LogOut size={13} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}