'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Bell, ChevronDown, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Star, Sun, Moon, Menu, X, LayoutDashboard, TrendingUp, BarChart2, Briefcase, Shield, BookOpen, MoreHorizontal, MessageSquare, Wallet, AlertCircle, DollarSign } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const NAV_ITEMS = [
  { label: 'Dashboard', href: '/trading-dashboard', icon: LayoutDashboard },
  { label: 'Trade', href: '/trade-trading-workspace', icon: TrendingUp },
  { label: 'Markets', href: '/markets', icon: BarChart2 },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Funds', href: '/finance', icon: Wallet },
  { label: 'KYC', href: '/kyc', icon: Shield },
  { label: 'Rewards', href: '#', icon: Star },
  { label: 'Academy', href: '#', icon: BookOpen },
];

interface ClientNotification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'kyc' | 'trade' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const CLIENT_NOTIFICATIONS: ClientNotification[] = [
  { id: 'cn-001', type: 'deposit', title: 'Deposit Confirmed', message: '$2,500 USDC deposit has been confirmed and credited to your account', time: '2 min ago', read: false },
  { id: 'cn-002', type: 'kyc', title: 'KYC Verification Pending', message: 'Your identity documents are under review. This usually takes 24-48 hours', time: '1 hr ago', read: false },
  { id: 'cn-003', type: 'withdrawal', title: 'Withdrawal Processing', message: 'Your withdrawal of $500 USDC is being processed. Expected: 1-3 business days', time: '3 hrs ago', read: false },
  { id: 'cn-004', type: 'trade', title: 'Order Filled', message: 'Buy order for 0.05 BTC at $67,842 has been fully filled', time: '5 hrs ago', read: true },
  { id: 'cn-005', type: 'kyc', title: 'KYC Completed', message: 'Your identity verification is complete. Full trading access is now enabled', time: '1 day ago', read: true },
  { id: 'cn-006', type: 'system', title: 'Security Alert', message: 'New login detected from Chrome on Windows. If this was not you, secure your account', time: '2 days ago', read: true },
];

const NOTIF_ICONS: Record<string, React.ElementType> = {
  deposit: DollarSign,
  withdrawal: ArrowUpFromLine,
  kyc: Shield,
  trade: TrendingUp,
  system: AlertCircle,
};

const NOTIF_COLORS: Record<string, string> = {
  deposit: '#22c55e',
  withdrawal: '#f59e0b',
  kyc: '#3b82f6',
  trade: '#F5C400',
  system: '#ef4444',
};

export default function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotification[]>(CLIENT_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-screen-2xl mx-auto flex items-center h-12 px-4 xl:px-6 gap-4">
        {/* Logo */}
        <Link href="/trading-dashboard" className="flex items-center gap-2 shrink-0">
          <AppLogo size={28} />
          <span className="font-semibold text-sm tracking-tight hidden sm:block" style={{ color: 'var(--primary)' }}>
            CryptoVault
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {NAV_ITEMS?.map((item) => (
            <Link
              key={`nav-${item?.label}`}
              href={item?.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
                pathname === item?.href
                  ? 'bg-primary-subtle text-gold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item?.label}
            </Link>
          ))}
          <button className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150">
            <MoreHorizontal size={14} />
            <span>More</span>
          </button>
        </nav>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Account actions */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Link href="/finance" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150 active:scale-95"
              style={{ backgroundColor: 'var(--positive)', color: '#fff' }}>
              <ArrowDownToLine size={12} />
              Deposit
            </Link>
            <Link href="/finance" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all duration-150 hover:bg-muted active:scale-95"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <ArrowUpFromLine size={12} />
              Withdraw
            </Link>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all duration-150 hover:bg-muted active:scale-95"
              style={{ color: 'var(--muted-foreground)' }}>
              <ArrowLeftRight size={12} />
              Transfer
            </button>
          </div>

          <button className="p-2 rounded hover:bg-muted transition-colors relative" style={{ color: 'var(--muted-foreground)' }}>
            <Star size={15} />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded hover:bg-muted transition-colors relative"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>
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
                    <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--primary)' }}>Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.map(n => {
                    const Icon = NOTIF_ICONS[n.type] || Bell;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer hover:bg-white/3 transition-colors"
                        style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${NOTIF_COLORS[n.type]}18` }}>
                          <Icon size={12} style={{ color: NOTIF_COLORS[n.type] }} />
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
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button className="w-full text-xs text-center py-1" style={{ color: 'var(--primary)' }}>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Day/Night Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-muted transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded hover:bg-muted transition-colors ml-1 border" style={{ borderColor: 'var(--border)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              A
            </div>
            <span className="text-xs font-medium hidden md:block" style={{ color: 'var(--foreground)' }}>Main Account</span>
            <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {/* Admin link */}
          <Link href="/admin-dashboard" className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-all hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}>
            <Shield size={13} />
            <span>Admin</span>
          </Link>

          {/* Settings link */}
          <Link href="/settings" className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-all hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}>
            <Sun size={13} />
            <span>Settings</span>
          </Link>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded hover:bg-muted" style={{ color: 'var(--muted-foreground)' }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS?.map((item) => (
              <Link
                key={`mobile-nav-${item?.label}`}
                href={item?.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                  pathname === item?.href ? 'bg-primary-subtle text-gold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon size={16} />
                {item?.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button className="flex-1 py-2 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--positive)', color: '#fff' }}>Deposit</button>
              <button className="flex-1 py-2 rounded text-xs font-medium border" style={{ borderColor: 'var(--border)' }}>Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}