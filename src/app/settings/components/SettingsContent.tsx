'use client';
import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Eye, EyeOff, Smartphone, Key, LogOut, Check, Monitor, MapPin, Clock, AlertTriangle, History, Phone, Globe, Lock, CheckCircle, XCircle, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';

import KYCVerificationFlow from '@/components/kyc/KYCVerificationFlow';
import { kycService, KYCStatus } from '@/services/kyc.service';

type Tab = 'profile' | 'security' | 'kyc' | 'notifications' | 'preferences';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Personal Information', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'kyc', label: 'Identity Verification', icon: FileCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Eye },
];

const MOCK_SESSIONS = [
  { device: 'Chrome on macOS', location: 'London, UK', lastActive: 'Current session', current: true, browser: 'Chrome 120' },
  { device: 'Safari on iPhone', location: 'London, UK', lastActive: '2 hours ago', current: false, browser: 'Safari 17' },
  { device: 'Firefox on Windows', location: 'Manchester, UK', lastActive: '3 days ago', current: false, browser: 'Firefox 121' },
];

const MOCK_LOGIN_HISTORY = [
  { date: '27 Aug 2026, 21:13', device: 'Chrome on macOS', browser: 'Chrome 120', location: 'London, UK', result: 'success' },
  { date: '26 Aug 2026, 09:42', device: 'Safari on iPhone', browser: 'Safari 17', location: 'London, UK', result: 'success' },
  { date: '25 Aug 2026, 14:21', device: 'Unknown device', browser: 'Unknown', location: 'Frankfurt, DE', result: 'failed' },
  { date: '24 Aug 2026, 18:05', device: 'Chrome on macOS', browser: 'Chrome 120', location: 'London, UK', result: 'success' },
  { date: '23 Aug 2026, 11:30', device: 'Firefox on Windows', browser: 'Firefox 121', location: 'Manchester, UK', result: 'success' },
];

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+34', flag: '🇪🇸', name: 'ES' },
  { code: '+39', flag: '🇮🇹', name: 'IT' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+1', flag: '🇨🇦', name: 'CA' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+82', flag: '🇰🇷', name: 'KR' },
  { code: '+55', flag: '🇧🇷', name: 'BR' },
  { code: '+52', flag: '🇲🇽', name: 'MX' },
  { code: '+31', flag: '🇳🇱', name: 'NL' },
  { code: '+46', flag: '🇸🇪', name: 'SE' },
  { code: '+41', flag: '🇨🇭', name: 'CH' },
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'Canada', 'Singapore', 'UAE', 'India', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Switzerland', 'Other',
];

// KYC status display config — ready for API fields: kycStatus, kycRequired, kycCompletedAt
interface KYCStatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  description: string;
}

const KYC_STATUS_CONFIG: Record<KYCStatus, KYCStatusConfig> = {
  not_started: {
    label: 'Not Started',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.2)',
    icon: AlertCircle,
    description: 'Identity verification has not been started.',
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    icon: RefreshCw,
    description: 'Your verification is partially completed. Continue to finish.',
  },
  submitted: {
    label: 'Pending Review',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    icon: Clock,
    description: 'Documents submitted. Our compliance team is reviewing your application.',
  },
  under_review: {
    label: 'Pending Review',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    icon: Clock,
    description: 'Your application is under active review. Expected: 1–2 business days.',
  },
  verified: {
    label: 'Verified',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    icon: CheckCircle,
    description: 'Identity verification complete. Full account access is enabled.',
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    icon: XCircle,
    description: 'Verification was not approved. Please review the reason and resubmit.',
  },
};

// This interface mirrors what the real API will return
// Backend fields: kycStatus, kycRequired, kycCompletedAt
interface AccountKYCState {
  kycStatus: KYCStatus;
  kycRequired: boolean;
  kycCompletedAt: string | null;
}

interface SettingsContentProps {
  initialTab?: Tab;
}

export default function SettingsContent({ initialTab }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'profile');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  // KYC state — structured to match future API response shape
  const [kycState, setKycState] = useState<AccountKYCState>({
    kycStatus: 'not_started',
    kycRequired: true,
    kycCompletedAt: null,
  });
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    // BACKEND INTEGRATION: GET /api/v1/kyc/:customerId
    // Response will include: { kycStatus, kycRequired, kycCompletedAt, ... }
    kycService.getKYCStatus('cust-001').then(data => {
      setKycState({
        kycStatus: data.status,
        kycRequired: true, // Will come from API: kycRequired field
        kycCompletedAt: data.reviewedAt, // Will come from API: kycCompletedAt field
      });
      setKycLoading(false);
    });
  }, []);

  // Profile fields
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Morgan');
  const [email, setEmail] = useState('alex.morgan@email.com');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('5550000000');
  const [country, setCountry] = useState('United States');

  // Password fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = () => {
    setPwError('');
    if (!currentPw) { setPwError('Current password is required'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 3000);
  };

  const revokeSession = (idx: number) => {
    setSessions(prev => prev.filter((_, i) => i !== idx));
  };

  const revokeAllOther = () => {
    setSessions(prev => prev.filter(s => s.current));
  };

  const inputCls = "w-full px-3 py-2 rounded text-sm border focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors";
  const inputStyle = { backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  const kycStatusConfig = KYC_STATUS_CONFIG[kycState.kycStatus];
  const KycStatusIcon = kycStatusConfig.icon;
  const kycIncomplete = kycState.kycRequired && kycState.kycStatus !== 'verified';

  return (
    <div className="py-4 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Profile &amp; Settings</h1>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manage your account information, security, and verification</p>
      </div>

      {/* KYC mandatory notice — shown when verification is incomplete */}
      {kycIncomplete && kycState.kycStatus !== 'submitted' && kycState.kycStatus !== 'under_review' && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded border" style={{ backgroundColor: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Identity verification required</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Complete your verification to unlock all account functionality.</p>
          </div>
          <button
            onClick={() => setActiveTab('kyc')}
            className="text-xs px-3 py-1.5 rounded font-semibold shrink-0 transition-all hover:opacity-90"
            style={{ backgroundColor: '#f59e0b', color: '#000' }}
          >
            Complete Verification
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Sidebar tabs */}
        <div className="sm:w-52 shrink-0">
          <div className="rounded border overflow-hidden flex sm:flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-left transition-colors border-r sm:border-r-0 sm:border-b last:border-0 hover:bg-white/5 ${activeTab === tab.id ? 'bg-primary-subtle' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)' }}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'kyc' && kycIncomplete && (
                  <span className="hidden sm:inline ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#f59e0b' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="rounded border p-4 sm:p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Personal Information</h2>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {firstName.charAt(0)}
                </div>
                <div>
                  <button className="text-xs px-3 py-1.5 rounded border transition-all hover:bg-muted"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    Change Photo
                  </button>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <Phone size={11} className="inline mr-1" />
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCode}
                      onChange={e => setPhoneCode(e.target.value)}
                      className="text-sm px-2 py-2 rounded border focus:outline-none shrink-0"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', width: '90px' }}
                    >
                      {COUNTRY_CODES.map((c, i) => (
                        <option key={`${c.code}-${c.name}-${i}`} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(val);
                      }}
                      placeholder="Phone number"
                      className={`flex-1 ${inputCls}`}
                      style={inputStyle}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <Globe size={11} className="inline mr-1" />
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saved && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--positive)' }}>
                    <Check size={13} /> Profile saved successfully
                  </div>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-4">
              {/* KYC Status Header */}
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Identity Verification</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      KYC verification is required for all accounts. Complete your verification to unlock full trading access.
                    </p>
                  </div>
                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold shrink-0"
                    style={{ backgroundColor: kycStatusConfig.bg, border: `1px solid ${kycStatusConfig.border}`, color: kycStatusConfig.color }}
                  >
                    <KycStatusIcon size={11} />
                    {kycStatusConfig.label}
                  </div>
                </div>

                {/* Status description */}
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded text-xs" style={{ backgroundColor: kycStatusConfig.bg, border: `1px solid ${kycStatusConfig.border}` }}>
                  <KycStatusIcon size={12} className="mt-0.5 shrink-0" style={{ color: kycStatusConfig.color }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>{kycStatusConfig.description}</span>
                  {kycState.kycCompletedAt && (
                    <span className="ml-auto shrink-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Completed: {kycState.kycCompletedAt}
                    </span>
                  )}
                </div>

                {/* Verification steps overview */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Personal Info', done: kycState.kycStatus !== 'not_started' },
                    { label: 'Address', done: kycState.kycStatus !== 'not_started' && kycState.kycStatus !== 'in_progress' },
                    { label: 'Documents', done: ['submitted', 'under_review', 'verified'].includes(kycState.kycStatus) },
                    { label: 'Review', done: kycState.kycStatus === 'verified' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: step.done ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)' }}>
                        {step.done
                          ? <CheckCircle size={10} style={{ color: '#22c55e' }} />
                          : <span className="text-xs font-bold" style={{ color: '#6b7280', fontSize: '9px' }}>{i + 1}</span>
                        }
                      </div>
                      <span style={{ color: step.done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show KYC form if not yet submitted/verified */}
              {(kycState.kycStatus === 'not_started' || kycState.kycStatus === 'in_progress' || kycState.kycStatus === 'rejected') && (
                <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <KYCVerificationFlow
                    onComplete={() => {
                      setKycState(prev => ({ ...prev, kycStatus: 'submitted' }));
                    }}
                    isFirstLogin={false}
                  />
                </div>
              )}

              {/* Pending review state */}
              {(kycState.kycStatus === 'submitted' || kycState.kycStatus === 'under_review') && (
                <div className="rounded border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Clock size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Documents Under Review</h3>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                    Your identity documents have been submitted and are being reviewed by our compliance team. This typically takes 1–2 business days. You will be notified by email once the review is complete.
                  </p>
                </div>
              )}

              {/* Verified state */}
              {kycState.kycStatus === 'verified' && (
                <div className="rounded border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle size={20} style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Identity Verified</h3>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                    Your identity has been successfully verified. Full account access is enabled.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Change Password */}
              <div className="rounded border p-4 sm:p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Lock size={15} style={{ color: 'var(--primary)' }} />
                  <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Change Password</h2>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Passwords are transmitted over HTTPS and stored using secure hashing. Never share your password.
                </p>

                {pwError && (
                  <div className="p-3 rounded text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                    {pwError}
                  </div>
                )}
                {pwSaved && (
                  <div className="flex items-center gap-2 p-3 rounded text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                    <Check size={12} /> Password updated successfully
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        className={`${inputCls} pr-10`}
                        style={inputStyle}
                      />
                      <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className={`${inputCls} pr-10`}
                        style={inputStyle}
                      />
                      <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className={`${inputCls} pr-10`}
                        style={inputStyle}
                      />
                      <button onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                >
                  Update Password
                </button>
              </div>

              {/* 2FA */}
              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.1)' }}>
                      <Smartphone size={15} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        Add an extra layer of security using a TOTP authenticator app (e.g. Google Authenticator, Authy).
                      </p>
                      <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded font-semibold ${twoFaEnabled ? 'text-positive' : 'text-negative'}`}
                        style={{ backgroundColor: twoFaEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                        {twoFaEnabled ? '● Enabled' : '● Disabled'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                    className="px-3 py-1.5 rounded text-xs font-semibold border transition-all hover:bg-muted shrink-0"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {twoFaEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* API Keys */}
              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Key size={15} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>API Keys</h3>
                </div>
                <div className="rounded border p-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Main API Key</p>
                    <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>tc_••••••••••••••••••••••••••••••••</p>
                  </div>
                  <button className="text-xs px-2 py-1 rounded border transition-all hover:bg-muted shrink-0"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    Reveal
                  </button>
                </div>
                <button className="mt-3 text-xs px-3 py-1.5 rounded border transition-all hover:bg-muted"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  + Generate New Key
                </button>
              </div>

              {/* Active Sessions */}
              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor size={15} style={{ color: 'var(--primary)' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Active Sessions</h3>
                  </div>
                  <button onClick={revokeAllOther} className="text-xs hover:underline" style={{ color: 'var(--negative)' }}>
                    Sign out all other sessions
                  </button>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Devices currently signed in to your account.
                </p>
                <div className="space-y-0">
                  {sessions.map((session, idx) => (
                    <div key={`sess-${idx}`} className="flex items-center justify-between py-3 border-b last:border-b-0 gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--muted)' }}>
                          <Monitor size={13} style={{ color: 'var(--muted-foreground)' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{session.device}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              <MapPin size={10} /> {session.location}
                            </span>
                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              <Clock size={10} /> {session.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                      {session.current ? (
                        <span className="text-xs px-2 py-0.5 rounded font-semibold text-positive shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>Current</span>
                      ) : (
                        <button onClick={() => revokeSession(idx)} className="text-xs px-2 py-1 rounded border transition-all hover:bg-muted shrink-0" style={{ borderColor: 'var(--negative)', color: 'var(--negative)' }}>
                          <LogOut size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login History */}
              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <History size={15} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Login Activity</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Recent sign-in attempts to your account.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[480px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Date', 'Device', 'Browser', 'Location', 'Result'].map(h => (
                          <th key={h} className="text-left pb-2 pr-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_LOGIN_HISTORY.map((entry, idx) => (
                        <tr key={`lh-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--foreground)' }}>{entry.date}</td>
                          <td className="py-2.5 pr-3 truncate max-w-[120px]" style={{ color: 'var(--foreground)' }}>{entry.device}</td>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--muted-foreground)' }}>{entry.browser}</td>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--muted-foreground)' }}>{entry.location}</td>
                          <td className="py-2.5">
                            {entry.result === 'success' ? (
                              <span className="px-1.5 py-0.5 rounded text-positive font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>Success</span>
                            ) : (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--negative)' }}>
                                <AlertTriangle size={10} /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded border p-4 sm:p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notification Preferences</h2>
              {[
                { label: 'Trade Executions', desc: 'Get notified when your orders are filled', defaultOn: true },
                { label: 'Price Alerts', desc: 'Receive alerts when assets hit your target price', defaultOn: true },
                { label: 'Deposits & Withdrawals', desc: 'Notifications for all fund movements', defaultOn: true },
                { label: 'Security Alerts', desc: 'Login attempts and security events', defaultOn: true },
                { label: 'Agent Messages', desc: 'New messages from your assigned agent', defaultOn: true },
                { label: 'Promotions & News', desc: 'Platform updates and promotional offers', defaultOn: false },
              ].map((item, idx) => (
                <NotificationToggle key={`notif-${idx}`} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />
              ))}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="rounded border p-4 sm:p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Display Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Currency Display', options: ['USD', 'EUR', 'GBP', 'BTC'], selected: 'USD' },
                  { label: 'Language', options: ['English', 'Spanish', 'French', 'German'], selected: 'English' },
                  { label: 'Timezone', options: ['UTC', 'UTC+1', 'UTC-5', 'UTC+8'], selected: 'UTC' },
                ].map((pref, idx) => (
                  <div key={`pref-${idx}`}>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{pref.label}</label>
                    <select
                      defaultValue={pref.selected}
                      className={inputCls}
                      style={inputStyle}
                    >
                      {pref.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0"
        style={{ backgroundColor: on ? 'var(--primary)' : 'var(--muted)' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{ backgroundColor: on ? '#000' : 'var(--muted-foreground)', left: on ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}
