'use client';
import React, { useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Copy, CheckCircle, TrendingUp, Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import { authService, RegisterDTO } from '@/services/auth.service';
import { Suspense } from 'react';
import Icon from '@/components/ui/AppIcon';


interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const DEMO_ACCOUNTS = [
  { role: 'Trader', email: 'trader@cryptovault.app', password: 'Vault2026!' },
  { role: 'Admin', email: 'admin@cryptovault.app', password: 'Admin2026!' },
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'Canada', 'Singapore', 'UAE', 'India', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Switzerland', 'Other',
];

function AuthScreenInner() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const loginForm = useForm<LoginFormData>({ defaultValues: { email: '', password: '', remember: false } });
  const registerForm = useForm<RegisterFormData>({ defaultValues: { firstName: '', lastName: '', email: '', phone: '', country: '', password: '', confirmPassword: '', terms: false } });

  // Attribution params from URL
  const attribution = {
    source_site: searchParams.get('source') || '',
    affiliate_id: searchParams.get('affiliate') || '',
    campaign_id: searchParams.get('campaign') || '',
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_term: searchParams.get('utm_term') || '',
    utm_content: searchParams.get('utm_content') || '',
    landing_page: typeof window !== 'undefined' ? '' : '',
    referrer: '',
    click_id: searchParams.get('click_id') || '',
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    loginForm.setValue('email', account.email);
    loginForm.setValue('password', account.password);
    setTab('login');
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError('');
    const result = await authService.login({ email: data.email, password: data.password });
    setIsLoading(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    if (result.user?.role === 'admin') {
      window.location.href = '/admin-dashboard';
    } else {
      window.location.href = '/trading-dashboard';
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setAuthError('');
    const dto: RegisterDTO = { ...data, ...attribution };
    const result = await authService.register(dto);
    setIsLoading(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    setAuthSuccess('Account created! Please check your email to verify your account.');
    setTab('login');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 p-10 xl:p-16 justify-between relative overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--primary) 0%, transparent 50%)`
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <AppLogo size={36} />
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>CryptoVault</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--foreground)' }}>
            Institutional-grade<br />
            <span style={{ color: 'var(--primary)' }}>crypto trading</span><br />
            for serious traders.
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--muted-foreground)' }}>
            Advanced charting, real-time order books, and professional portfolio management — all in one terminal.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, title: 'Live Markets', desc: 'Real-time prices across crypto, forex, and commodities' },
              { icon: Shield, title: 'Secure Platform', desc: 'HTTP-only sessions, 2FA, and device management' },
              { icon: Zap, title: 'Fast Execution', desc: 'Sub-millisecond order routing to liquidity providers' },
              { icon: Globe, title: 'Global Access', desc: 'Trade from 180+ countries with multi-currency support' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={`feature-${title}`} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <Icon size={16} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6">
            {[
              { label: '14,820+', sub: 'Registered traders' },
              { label: '$2.1B+', sub: '30-day volume' },
              { label: '99.9%', sub: 'Platform uptime' },
            ].map(({ label, sub }) => (
              <div key={`stat-${label}`}>
                <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 py-10 xl:px-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <AppLogo size={28} />
          <span className="font-bold" style={{ color: 'var(--primary)' }}>CryptoVault</span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg p-1 mb-8" style={{ backgroundColor: 'var(--muted)' }}>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${tab === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${tab === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Create Account
          </button>
        </div>

        {authSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4 border" style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'var(--positive)', color: 'var(--positive)' }}>
            <CheckCircle size={16} />
            <p className="text-sm">{authSuccess}</p>
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-lg mb-4 border" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'var(--negative)' }}>
            <p className="text-sm" style={{ color: 'var(--negative)' }}>{authError}</p>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
              <input
                type="email"
                {...loginForm.register('email', { required: 'Email is required' })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-md text-sm border transition-colors focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--input)', borderColor: loginForm.formState.errors.email ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Password</label>
                <button type="button" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...loginForm.register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-md text-sm border transition-colors focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--input)', borderColor: loginForm.formState.errors.password ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" {...loginForm.register('remember')} className="w-3.5 h-3.5 rounded accent-primary" />
              <label htmlFor="remember" className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-md text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: 'var(--primary-foreground)' }} />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>First Name</label>
                <input
                  {...registerForm.register('firstName', { required: 'Required' })}
                  placeholder="Alex"
                  className="w-full px-3 py-2.5 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.firstName ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
                {registerForm.formState.errors.firstName && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>Required</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Last Name</label>
                <input
                  {...registerForm.register('lastName', { required: 'Required' })}
                  placeholder="Mercer"
                  className="w-full px-3 py-2.5 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.lastName ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
                {registerForm.formState.errors.lastName && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>Required</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
              <input
                type="email"
                {...registerForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-md text-sm border focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.email ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {registerForm.formState.errors.email && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Phone Number</label>
                <input
                  {...registerForm.register('phone', { required: 'Required' })}
                  placeholder="+44 7700 900000"
                  className="w-full px-3 py-2.5 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.phone ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Country</label>
                <select
                  {...registerForm.register('country', { required: 'Required' })}
                  className="w-full px-3 py-2.5 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.country ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map(c => <option key={`country-${c}`} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...registerForm.register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.password ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {registerForm.formState.errors.password && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerForm.register('confirmPassword', { required: 'Required' })}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 pr-10 rounded-md text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: registerForm.formState.errors.confirmPassword ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {registerForm.formState.errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" {...registerForm.register('terms', { required: true })} className="mt-0.5 w-3.5 h-3.5 accent-primary" />
              <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                I agree to the <button type="button" className="underline" style={{ color: 'var(--primary)' }}>Terms of Service</button> and <button type="button" className="underline" style={{ color: 'var(--primary)' }}>Privacy Policy</button>
              </label>
            </div>
            {registerForm.formState.errors.terms && <p className="text-xs" style={{ color: 'var(--negative)' }}>You must accept the terms</p>}

            {attribution.source_site && (
              <p className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                Referred by: {attribution.source_site} {attribution.affiliate_id && `· Affiliate: ${attribution.affiliate_id}`}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-md text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: 'var(--primary-foreground)' }} />
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        )}

        {/* Demo credentials */}
        <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>DEMO ACCOUNTS</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(account => (
              <div key={`demo-${account.role}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>{account.role}</span>
                  <span className="text-xs font-mono truncate" style={{ color: 'var(--foreground)' }}>{account.email}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleCopy(account.password, `pw-${account.role}`)} className="p-1 rounded hover:bg-card transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                    {copiedField === `pw-${account.role}` ? <CheckCircle size={12} style={{ color: 'var(--positive)' }} /> : <Copy size={12} />}
                  </button>
                  <button onClick={() => fillDemo(account)} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ backgroundColor: 'var(--card)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }} />}>
      <AuthScreenInner />
    </Suspense>
  );
}