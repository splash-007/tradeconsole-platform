'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Bell, ChevronDown, Sun, Moon, Menu, X, TrendingUp, BarChart2, Briefcase, MessageSquare, Wallet, BookOpen, Star, LogOut, Settings, AlertCircle, DollarSign, Bot, Activity, CheckCheck, ExternalLink, Gift, Globe } from 'lucide-react';
import { useCustomerAuthGuard, performLogout } from '@/lib/auth-guard';
import { notificationService, AppNotification } from '@/services/notification.service';
import { preferencesService } from '@/services/preferences.service';

const NAV_ITEMS = [
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Trade', href: '/trade-trading-workspace', icon: TrendingUp },
  { label: 'Markets', href: '/markets', icon: BarChart2 },
  { label: 'Trading Bot', href: '/trading-bot', icon: Bot },
  { label: 'Prediction Markets', href: '/prediction-markets', icon: Activity },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
  { label: 'Funds', href: '/finance', icon: Wallet },
  { label: 'News & Learn', href: '/news-learn', icon: BookOpen },
  { label: 'Support', href: '/messages', icon: MessageSquare },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CHF', symbol: '₣' },
];

const CATEGORY_COLORS: Record<string, string> = {
  finance: '#22c55e', trading: '#F5C400', kyc: '#3b82f6',
  security: '#ef4444', support: '#8b5cf6', account: '#06b6d4',
  system: '#6b7280', dividend: '#f59e0b',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  finance: DollarSign, trading: TrendingUp, kyc: Settings,
  security: AlertCircle, support: MessageSquare, account: Settings,
  system: AlertCircle, dividend: Star,
};

type NotifTab = 'recent' | 'unread' | 'important';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { status: authStatus } = useCustomerAuthGuard();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifTab, setNotifTab] = useState<NotifTab>('recent');
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const theme = preferencesService.getTheme();
    const dark = theme === 'dark';
    setIsDark(dark);
    preferencesService.applyTheme(dark ? 'dark' : 'light');
    // Load saved preferences
    if (typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('tc-lang');
      const savedCurrency = localStorage.getItem('tc-currency');
      if (savedLang) setSelectedLang(savedLang);
      if (savedCurrency) setSelectedCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    setNotifications(notificationService.getActiveNotifications());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const supportUnread = notificationService.getUnreadSupportCount();

  const toggleTheme = () => {
    const next = preferencesService.toggleTheme();
    setIsDark(next === 'dark');
  };

  const handleMarkRead = (id: string) => {
    const updated = notificationService.markRead(id);
    setNotifications(updated.filter(n => !n.dismissedAt));
  };

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllRead();
    setNotifications(updated.filter(n => !n.dismissedAt));
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notificationService.dismiss(id);
    setNotifications(updated.filter(n => !n.dismissedAt));
  };

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    setLangOpen(false);
    if (typeof localStorage !== 'undefined') localStorage.setItem('tc-lang', code);
  };

  const handleSelectCurrency = (code: string) => {
    setSelectedCurrency(code);
    setCurrencyOpen(false);
    if (typeof localStorage !== 'undefined') localStorage.setItem('tc-currency', code);
  };

  const filteredNotifs = (() => {
    if (notifTab === 'unread') return notifications.filter(n => !n.readAt);
    if (notifTab === 'important') return notifications.filter(n => n.severity === 'critical' || n.severity === 'warning');
    return notifications.slice(0, 8);
  })();

  const handleLogout = async () => {
    setProfileOpen(false);
    await performLogout(router);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'disabled';
  if (authMode !== 'disabled' && (authStatus === 'loading' || authStatus === 'unauthenticated' || authStatus === 'forbidden' || authStatus === 'suspended')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-screen-2xl mx-auto flex items-center h-12 px-4 xl:px-6 gap-3">
          {/* Logo */}
          <Link href="/portfolio" className="flex items-center gap-2 shrink-0">
            <AppLogo size={28} />
            <span className="font-semibold text-sm tracking-tight hidden sm:block" style={{ color: 'var(--primary)' }}>Trade Console</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV_ITEMS.map((item) => {
              const isSupport = item.label === 'Support';
              const isActive = pathname === item.href || (item.href === '/finance' && pathname.startsWith('/finance'));
              return (
                <Link
                  key={`nav-${item.label}`}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${isActive ? 'bg-primary-subtle text-gold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  {item.label}
                  {isSupport && supportUnread > 0 && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>
                      {supportUnread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Language selector */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); setNotifOpen(false); setProfileOpen(false); }}
                className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-muted transition-colors text-xs font-medium"
                style={{ color: 'var(--muted-foreground)' }}
                title="Language"
              >
                <Globe size={13} />
                <span className="hidden md:block">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Interface Language</p>
                  </div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors"
                      style={{ color: selectedLang === lang.code ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      <span>{lang.flag} {lang.label}</span>
                      {selectedLang === lang.code && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Full translation coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Currency selector */}
            <div className="relative hidden sm:block" ref={currencyRef}>
              <button
                onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); setNotifOpen(false); setProfileOpen(false); }}
                className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-muted transition-colors text-xs font-medium"
                style={{ color: 'var(--muted-foreground)' }}
                title="Display currency"
              >
                <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCurrency}</span>
                <ChevronDown size={10} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Display Currency</p>
                  </div>
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCurrency(c.code)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors"
                      style={{ color: selectedCurrency === c.code ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      <span><span className="font-mono font-semibold">{c.symbol}</span> {c.code}</span>
                      {selectedCurrency === c.code && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Display preference only</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setLangOpen(false); setCurrencyOpen(false); }}
                className="p-2 rounded hover:bg-muted transition-colors relative"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-96 max-w-[calc(100vw-1rem)] rounded-lg border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</p>
                      {unreadCount > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted transition-colors" style={{ color: 'var(--primary)' }}>
                        <CheckCheck size={11} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                    {(['recent', 'unread', 'important'] as NotifTab[]).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setNotifTab(tab)}
                        className="flex-1 py-2 text-xs font-medium capitalize transition-colors"
                        style={{ color: notifTab === tab ? 'var(--primary)' : 'var(--muted-foreground)', borderBottom: notifTab === tab ? '2px solid var(--primary)' : '2px solid transparent' }}
                      >
                        {tab}
                        {tab === 'unread' && unreadCount > 0 && (
                          <span className="ml-1 px-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--negative)', color: '#fff', fontSize: '9px' }}>{unreadCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {filteredNotifs.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell size={20} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {notifTab === 'unread' ? 'No unread notifications' : notifTab === 'important' ? 'No important notifications' : 'No notifications'}
                        </p>
                      </div>
                    ) : (
                      filteredNotifs.map(n => {
                        const NIcon = CATEGORY_ICONS[n.category] || Bell;
                        const color = CATEGORY_COLORS[n.category] || '#6b7280';
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleMarkRead(n.id)}
                            className="group flex items-start gap-3 px-4 py-3 border-b cursor-pointer hover:bg-muted transition-colors"
                            style={{ borderColor: 'var(--border)', backgroundColor: !n.readAt ? 'rgba(212,168,0,0.03)' : 'transparent' }}
                          >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}18` }}>
                              <NIcon size={12} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!n.readAt && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
                                  <button
                                    onClick={e => handleDismiss(n.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all"
                                    style={{ color: 'var(--muted-foreground)' }}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-60" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(n.createdAt)}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: `${color}15`, color }}>
                                  {n.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Dismissed items remain in history</p>
                    <Link href="/notifications" onClick={() => setNotifOpen(false)} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                      View all <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Day/Night Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-muted transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setLangOpen(false); setCurrencyOpen(false); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-muted transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>A</div>
                <span className="text-xs font-medium hidden sm:block">Alex M.</span>
                <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Alex Morgan</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>alex.morgan@email.com</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--muted-foreground)' }}>TC-2026-001847</p>
                  </div>
                  <div className="py-1">
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors" style={{ color: 'var(--foreground)' }}>
                      <Settings size={13} style={{ color: 'var(--muted-foreground)' }} /> Profile &amp; Settings
                    </Link>
                    <Link href="/programs" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors" style={{ color: 'var(--foreground)' }}>
                      <Gift size={13} style={{ color: 'var(--muted-foreground)' }} /> Programs &amp; Benefits
                    </Link>
                    <Link href="/notifications" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors" style={{ color: 'var(--foreground)' }}>
                      <Bell size={13} style={{ color: 'var(--muted-foreground)' }} /> Notifications
                    </Link>
                  </div>
                  <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors" style={{ color: 'var(--negative)' }}>
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2 rounded hover:bg-muted transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {drawerOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <div className="relative ml-auto w-72 h-full border-l overflow-y-auto animate-slide-up" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>Trade Console</span>
              <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>
            <nav className="p-3 space-y-0.5">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${pathname === item.href ? 'bg-primary-subtle text-gold' : 'hover:bg-muted'}`}
                  style={{ color: pathname === item.href ? 'var(--primary)' : 'var(--foreground)' }}
                >
                  <item.icon size={15} style={{ color: pathname === item.href ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* Mobile lang/currency */}
            <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Globe size={13} style={{ color: 'var(--muted-foreground)' }} />
                <select
                  value={selectedLang}
                  onChange={e => handleSelectLang(e.target.value)}
                  className="flex-1 text-xs rounded border px-2 py-1.5 focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold w-4" style={{ color: 'var(--muted-foreground)' }}>$</span>
                <select
                  value={selectedCurrency}
                  onChange={e => handleSelectCurrency(e.target.value)}
                  className="flex-1 text-xs rounded border px-2 py-1.5 focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                </select>
              </div>
            </div>
            <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium hover:bg-muted transition-colors" style={{ color: 'var(--negative)' }}>
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}