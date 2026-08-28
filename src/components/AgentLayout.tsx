'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Users, ClipboardList, PhoneCall, MessageSquare, Bell, Activity, User, ChevronRight, ChevronDown, LogOut, Sun, Moon, UserPlus, Menu, X } from 'lucide-react';

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

interface AgentNotification {
  id: string;
  type: 'lead' | 'message' | 'task' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: AgentNotification[] = [
  { id: 'agn-001', type: 'lead', title: 'New Lead Assigned', message: 'Thomas Bergmann has been assigned to you by Admin', time: '2 min ago', read: false },
  { id: 'agn-002', type: 'message', title: 'New Message', message: 'Alex Morgan: "Hi, I have a question about my deposit"', time: '8 min ago', read: false },
  { id: 'agn-003', type: 'lead', title: 'New Lead Assigned', message: 'Priya Sharma from India has been assigned to you', time: '25 min ago', read: false },
  { id: 'agn-004', type: 'message', title: 'New Message', message: 'David Kim: "When will my withdrawal be processed?"', time: '1 hr ago', read: false },
  { id: 'agn-005', type: 'task', title: 'Task Overdue', message: 'Follow-up call with Maria Garcia is overdue', time: '2 hrs ago', read: true },
  { id: 'agn-006', type: 'system', title: 'System Update', message: 'New trading features are now available for your clients', time: '3 hrs ago', read: true },
];

const NOTIF_COLORS: Record<string, string> = {
  lead: '#F5C400', message: '#3b82f6', task: '#ef4444', system: '#6b7280'
};

const NOTIF_HREFS: Record<string, string> = {
  lead: '/agent/customers',
  message: '/agent/messages',
  task: '/agent/tasks',
  system: '/agent/notifications',
};

const loadAgentNotifs = (): AgentNotification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFS;
  try {
    const saved = localStorage.getItem('cv-agent-notifs');
    if (saved) {
      const readIds: string[] = JSON.parse(saved);
      return INITIAL_NOTIFS.map(n => ({ ...n, read: readIds.includes(n.id) ? true : n.read }));
    }
  } catch {}
  return INITIAL_NOTIFS;
};

export default function AgentLayout({ children }: AgentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState<AgentNotification[]>(INITIAL_NOTIFS);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setNotifications(loadAgentNotifs());
  }, []);

  const persistAgentReadState = (notifs: AgentNotification[]) => {
    if (typeof localStorage !== 'undefined') {
      const readIds = notifs.filter(n => n.read).map(n => n.id);
      localStorage.setItem('cv-agent-notifs', JSON.stringify(readIds));
    }
  };

  const markAgentNotifRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(x => x.id === id ? { ...x, read: true } : x);
      persistAgentReadState(next);
      return next;
    });
  };

  const markAllAgentNotifsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persistAgentReadState(next);
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/agent') return pathname === '/agent';
    return pathname.startsWith(href);
  };

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileDrawerOpen(false); }, [pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    router.push('/secure-login');
  };

  const NavList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
      {NAV_ITEMS.map(item => {
        const active = isActive(item.href);
        return (
          <Link key={item.href} href={item.href}
            onClick={() => mobile && setMobileDrawerOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all hover:bg-white/5 ${(!collapsed || mobile) ? '' : 'justify-center'}`}
            style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: active ? 'rgba(245,196,0,0.08)' : undefined }}>
            <item.icon size={14} className="shrink-0" />
            {(!collapsed || mobile) && <span className="flex-1">{item.label}</span>}
            {(!collapsed || mobile) && item.badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

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
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--primary)' }}>CryonFX</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>Agent Portal</p>
            </div>
          )}
        </div>

        <NavList />

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
              <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>Agent Portal</p>
            </div>
          </div>
          <button onClick={() => setMobileDrawerOpen(false)} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>

        <NavList mobile />

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>S</div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>Sarah Chen</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Online</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors hover:bg-white/5" style={{ color: '#ef4444' }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded hover:bg-white/5 shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <h1 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Agent Portal</h1>
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
                <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl z-50 overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</p>
                      {unreadCount > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAgentNotifsRead()} className="text-xs" style={{ color: 'var(--primary)' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAgentNotifRead(n.id)}
                        className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer hover:bg-white/3 transition-colors"
                        style={{ borderColor: 'var(--border)', backgroundColor: n.read ? 'transparent' : 'rgba(245,196,0,0.03)' }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${NOTIF_COLORS[n.type]}18` }}>
                          {n.type === 'lead' ? <UserPlus size={12} style={{ color: NOTIF_COLORS[n.type] }} /> :
                           n.type === 'message' ? <MessageSquare size={12} style={{ color: NOTIF_COLORS[n.type] }} /> :
                           <Bell size={12} style={{ color: NOTIF_COLORS[n.type] }} />}
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
                    <Link href="/agent/notifications" onClick={() => setNotifOpen(false)} className="block w-full text-xs text-center py-1" style={{ color: 'var(--primary)' }}>
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Day/Night Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-white/5 transition-colors hidden sm:flex"
              style={{ color: 'var(--muted-foreground)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div className="flex items-center gap-2 relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors hover:bg-white/5"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>S</div>
                <span className="text-xs hidden sm:block" style={{ color: 'var(--foreground)' }}>Sarah Chen</span>
                <span className="text-xs px-1.5 py-0.5 rounded hidden md:block" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>Agent</span>
                <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Sarah Chen</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>sarah.chen@cryonfx.app</p>
                  </div>
                  <div className="py-1">
                    <Link href="/agent/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: 'var(--foreground)' }}>
                      <User size={13} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: '#ef4444' }}>
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
    </div>
  );
}
