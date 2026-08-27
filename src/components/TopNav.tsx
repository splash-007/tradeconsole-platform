'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Bell, ChevronDown, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Star, Sun, Menu, X, LayoutDashboard, TrendingUp, BarChart2, Briefcase, Shield, BookOpen, MoreHorizontal, MessageSquare, Wallet } from 'lucide-react';

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

export default function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
                  ? 'bg-primary-subtle text-gold' :'text-muted-foreground hover:text-foreground hover:bg-muted'
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
          <button className="p-2 rounded hover:bg-muted transition-colors relative" style={{ color: 'var(--muted-foreground)' }}>
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--negative)' }} />
          </button>
          <button className="p-2 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
            <Sun size={15} />
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