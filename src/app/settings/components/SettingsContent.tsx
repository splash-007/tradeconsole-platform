'use client';
import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Eye, EyeOff, Smartphone, Key, LogOut, Check, Monitor, MapPin, Clock, AlertTriangle, History, Phone, Globe, Lock, CheckCircle, XCircle, AlertCircle, RefreshCw, FileCheck, LayoutDashboard, CreditCard, FileText, Settings, DollarSign, Award, Calendar, Hash, ChevronDown, Info, Gift, Users, TrendingUp } from 'lucide-react';
import KYCVerificationFlow from '@/components/kyc/KYCVerificationFlow';
import { kycService, KYCStatus } from '@/services/kyc.service';
import { DividendEligibilityStatus, EmploymentStatus } from '@/services/dividend.service';
import { preferencesService, UserPreferences } from '@/services/preferences.service';

type SettingsSection =
  | 'overview' |'personal' |'account' |'programs' |'kyc' |'security' |'preferences' |'notifications' |'dividend' |'documents' |'sessions';

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'account', label: 'Account Information', icon: CreditCard },
  { id: 'programs', label: 'Programs & Benefits', icon: Gift },
  { id: 'kyc', label: 'Verification / KYC', icon: FileCheck },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'sessions', label: 'Sessions & Login Activity', icon: Monitor },
];

const MOCK_SESSIONS = [
  { id: 's1', device: 'Chrome on macOS', location: 'London, UK', lastActive: 'Active now', current: true, browser: 'Chrome 127', created: '27 Aug 2026', expires: '26 Sep 2026' },
  { id: 's2', device: 'Safari on iPhone 15', location: 'London, UK', lastActive: '2 hours ago', current: false, browser: 'Safari 17', created: '25 Aug 2026', expires: '24 Sep 2026' },
  { id: 's3', device: 'Firefox on Windows 11', location: 'Manchester, UK', lastActive: '3 days ago', current: false, browser: 'Firefox 121', created: '20 Aug 2026', expires: '19 Sep 2026' },
];

const MOCK_LOGIN_HISTORY = [
  { date: '27 Aug 2026, 21:13', device: 'Chrome on macOS', browser: 'Chrome 127', location: 'London, UK', result: 'success' },
  { date: '26 Aug 2026, 09:42', device: 'Safari on iPhone 15', browser: 'Safari 17', location: 'London, UK', result: 'success' },
  { date: '25 Aug 2026, 14:21', device: 'Unknown device', browser: 'Unknown', location: 'Frankfurt, DE', result: 'failed' },
  { date: '24 Aug 2026, 18:05', device: 'Chrome on macOS', browser: 'Chrome 127', location: 'London, UK', result: 'success' },
  { date: '23 Aug 2026, 11:30', device: 'Firefox on Windows 11', browser: 'Firefox 121', location: 'Manchester, UK', result: 'success' },
];

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US' }, { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+49', flag: '🇩🇪', name: 'DE' }, { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+34', flag: '🇪🇸', name: 'ES' }, { code: '+39', flag: '🇮🇹', name: 'IT' },
  { code: '+61', flag: '🇦🇺', name: 'AU' }, { code: '+1', flag: '🇨🇦', name: 'CA' },
  { code: '+65', flag: '🇸🇬', name: 'SG' }, { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+91', flag: '🇮🇳', name: 'IN' }, { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+55', flag: '🇧🇷', name: 'BR' }, { code: '+52', flag: '🇲🇽', name: 'MX' },
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'Canada', 'Singapore', 'UAE', 'India', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Switzerland', 'Other',
];

const TIMEZONES = [
  'UTC', 'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-8:00', 'UTC-7:00',
  'UTC-6:00', 'UTC-5:00', 'UTC-4:00', 'UTC-3:00', 'UTC+0:00 (London)',
  'UTC+1:00 (Paris)', 'UTC+2:00 (Cairo)', 'UTC+3:00 (Moscow)',
  'UTC+4:00 (Dubai)', 'UTC+5:30 (Mumbai)', 'UTC+7:00 (Bangkok)',
  'UTC+8:00 (Singapore)', 'UTC+9:00 (Tokyo)', 'UTC+10:00 (Sydney)',
];

interface KYCStatusConfig {
  label: string; color: string; bg: string; border: string;
  icon: React.ElementType; description: string;
}

const KYC_STATUS_CONFIG: Record<KYCStatus, KYCStatusConfig> = {
  not_started: { label: 'Not Started', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', icon: AlertCircle, description: 'Identity verification has not been started.' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: RefreshCw, description: 'Your verification is partially completed. Continue to finish.' },
  submitted: { label: 'Pending Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: Clock, description: 'Documents submitted. Our compliance team is reviewing your application.' },
  under_review: { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: Clock, description: 'Your application is under active review. Expected: 1–2 business days.' },
  additional_information_required: { label: 'Info Required', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle, description: 'Additional information is required to complete your verification.' },
  verified: { label: 'Verified', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: CheckCircle, description: 'Identity verification complete. Full account access is enabled.' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: XCircle, description: 'Verification was not approved. Please review the reason and resubmit.' },
};

const DIVIDEND_STATUS_CONFIG: Record<DividendEligibilityStatus, { label: string; color: string; bg: string }> = {
  not_evaluated: { label: 'Not Evaluated', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  under_review: { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  eligible: { label: 'Eligible', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  not_eligible: { label: 'Not Eligible', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  claim_available: { label: 'Claim Available', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  claim_submitted: { label: 'Claim Submitted', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  processing: { label: 'Processing', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  paid: { label: 'Paid', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

interface SettingsContentProps {
  initialTab?: string;
}

export default function SettingsContent({ initialTab }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>((initialTab as SettingsSection) || 'overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Morgan');
  const [email] = useState('alex.morgan@email.com');
  const [phoneCode, setPhoneCode] = useState('+44');
  const [phoneNumber, setPhoneNumber] = useState('7700900000');
  const [country, setCountry] = useState('United Kingdom');
  const [dateOfBirth, setDateOfBirth] = useState('1985-06-15');
  const [nationality, setNationality] = useState('British');
  const [address, setAddress] = useState('12 Canary Wharf');
  const [city, setCity] = useState('London');
  const [postalCode, setPostalCode] = useState('E14 5AB');
  const [occupation, setOccupation] = useState('Financial Analyst');
  const [employer, setEmployer] = useState('Morgan Capital Ltd');
  const [annualIncome, setAnnualIncome] = useState('75000-100000');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('employed');
  const [saved, setSaved] = useState(false);

  // Security state
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  // KYC state
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_started');
  const [kycLoading, setKycLoading] = useState(true);

  // Preferences state
  const [prefs, setPrefs] = useState<UserPreferences>(() => preferencesService.getPreferences());
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    tradeExecutions: true,
    priceAlerts: true,
    deposits: true,
    security: true,
    support: true,
    promotions: false,
    dividends: true,
  });

  useEffect(() => {
    kycService.getKYCStatus('cust-001').then(data => {
      setKycStatus(data.status);
      setKycLoading(false);
    });
  }, []);

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

  const handleSavePrefs = () => {
    preferencesService.savePreferences(prefs);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const revokeSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));
  const revokeAllOther = () => setSessions(prev => prev.filter(s => s.current));

  const inputCls = "w-full px-3 py-2 rounded text-sm border focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors";
  const inputStyle = { backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  const kycCfg = KYC_STATUS_CONFIG[kycStatus];
  const kycIncomplete = kycStatus !== 'verified';
  const activeNavItem = NAV_ITEMS.find(n => n.id === activeSection);

  return (
    <div className="py-4 max-w-6xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Profile &amp; Settings</h1>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manage your account, security, verification, and preferences</p>
      </div>

      {/* Mobile nav toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded border text-sm font-medium"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <div className="flex items-center gap-2">
            {activeNavItem && <activeNavItem.icon size={14} style={{ color: 'var(--primary)' }} />}
            <span>{activeNavItem?.label}</span>
          </div>
          <ChevronDown size={14} className={`transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        {mobileNavOpen && (
          <div className="mt-1 rounded border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileNavOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b last:border-b-0 transition-colors hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: activeSection === item.id ? 'var(--primary)' : 'var(--foreground)', backgroundColor: activeSection === item.id ? 'rgba(212,168,0,0.06)' : 'transparent' }}
              >
                <item.icon size={13} />
                {item.label}
                {item.id === 'kyc' && kycIncomplete && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* Left nav — desktop */}
        <div className="hidden lg:block w-52 shrink-0">
          <div className="rounded border overflow-hidden sticky top-16" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b last:border-b-0 transition-colors hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: activeSection === item.id ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: activeSection === item.id ? 'rgba(212,168,0,0.06)' : 'transparent' }}
              >
                <item.icon size={13} />
                <span className="flex-1">{item.label}</span>
                {item.id === 'kyc' && kycIncomplete && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#f59e0b' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {[
                  { label: 'Account Status', value: 'Active', color: '#22c55e', icon: CheckCircle, action: null },
                  { label: 'KYC Status', value: KYC_STATUS_CONFIG[kycStatus].label, color: KYC_STATUS_CONFIG[kycStatus].color, icon: FileCheck, action: kycIncomplete ? () => setActiveSection('kyc') : null, actionLabel: 'Complete' },
                  { label: 'Security', value: twoFaEnabled ? '2FA Enabled' : '2FA Disabled', color: twoFaEnabled ? '#22c55e' : '#f59e0b', icon: Shield, action: () => setActiveSection('security'), actionLabel: 'Manage' },
                  { label: 'Display Currency', value: prefs.displayCurrency, color: 'var(--primary)', icon: DollarSign, action: () => setActiveSection('preferences'), actionLabel: 'Change' },
                  { label: 'Language', value: prefs.language.toUpperCase(), color: 'var(--foreground)', icon: Globe, action: () => setActiveSection('preferences'), actionLabel: 'Change' },
                  { label: 'Time Zone', value: prefs.timezone, color: 'var(--foreground)', icon: Clock, action: () => setActiveSection('preferences'), actionLabel: 'Change' },
                  { label: 'Notifications', value: 'Configured', color: '#22c55e', icon: Bell, action: () => setActiveSection('notifications'), actionLabel: 'Manage' },
                  { label: 'Active Sessions', value: `${sessions.length} device${sessions.length !== 1 ? 's' : ''}`, color: 'var(--foreground)', icon: Monitor, action: () => setActiveSection('sessions'), actionLabel: 'View' },
                ].map((card, i) => (
                  <div key={i} className="rounded border p-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <card.icon size={13} style={{ color: card.color }} />
                      {card.action && (
                        <button onClick={card.action} className="text-xs" style={{ color: 'var(--primary)' }}>{card.actionLabel}</button>
                      )}
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
                      <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: card.color }}>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Complete Verification', icon: FileCheck, action: () => setActiveSection('kyc'), show: kycIncomplete },
                    { label: 'Change Password', icon: Lock, action: () => setActiveSection('security'), show: true },
                    { label: 'Manage Sessions', icon: Monitor, action: () => setActiveSection('sessions'), show: true },
                    { label: 'Update Preferences', icon: Settings, action: () => setActiveSection('preferences'), show: true },
                  ].filter(a => a.show).map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      className="flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium transition-all hover:bg-muted"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      <action.icon size={12} style={{ color: 'var(--primary)' }} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PERSONAL INFORMATION ── */}
          {activeSection === 'personal' && (
            <div className="rounded border p-4 sm:p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Personal Information</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Sensitive fields are subject to backend authorization before changes take effect.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {firstName.charAt(0)}
                </div>
                <div>
                  <button className="text-xs px-3 py-1.5 rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Change Photo</button>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email Address <span className="text-xs opacity-60">(contact support to change)</span></label>
                  <input type="email" value={email} readOnly className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Phone Number</label>
                  <div className="flex gap-2">
                    <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="text-sm px-2 py-2 rounded border focus:outline-none shrink-0" style={{ ...inputStyle, width: '90px' }}>
                      {COUNTRY_CODES.map((c, i) => <option key={`${c.code}-${i}`} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className={`flex-1 ${inputCls}`} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Nationality</label>
                  <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Country of Residence</label>
                  <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls} style={inputStyle}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Postal Code</label>
                  <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>Financial Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Employment Status</label>
                    <select value={employmentStatus} onChange={e => setEmploymentStatus(e.target.value as EmploymentStatus)} className={inputCls} style={inputStyle}>
                      <option value="employed">Employed</option>
                      <option value="self_employed">Self-Employed</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Occupation</label>
                    <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Employer / Company</label>
                    <input type="text" value={employer} onChange={e => setEmployer(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Annual Income Range</label>
                    <select value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="under-25000">Under $25,000</option>
                      <option value="25000-50000">$25,000 – $50,000</option>
                      <option value="50000-75000">$50,000 – $75,000</option>
                      <option value="75000-100000">$75,000 – $100,000</option>
                      <option value="100000-250000">$100,000 – $250,000</option>
                      <option value="over-250000">Over $250,000</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saved && <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--positive)' }}><Check size={13} /> Saved successfully</div>}
                <div className="flex-1" />
                <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Save Changes</button>
              </div>
            </div>
          )}

          {/* ── ACCOUNT INFORMATION ── */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Account Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Account ID', value: 'TC-2026-001847', icon: Hash },
                    { label: 'Account Type', value: 'Individual', icon: User },
                    { label: 'Account Status', value: 'Active', icon: CheckCircle },
                    { label: 'Member Since', value: 'August 2026', icon: Calendar },
                    { label: 'Account Tier', value: 'Standard', icon: Award },
                    { label: 'Base Currency', value: 'USD', icon: DollarSign },
                  ].map((field, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                      <field.icon size={13} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{field.label}</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Account Restrictions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Trading', status: 'Enabled', ok: true },
                    { label: 'Deposits', status: 'Enabled', ok: true },
                    { label: 'Withdrawals', status: kycStatus === 'verified' ? 'Enabled' : 'KYC Required', ok: kycStatus === 'verified' },
                    { label: 'Leverage Trading', status: kycStatus === 'verified' ? 'Enabled' : 'KYC Required', ok: kycStatus === 'verified' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{item.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: item.ok ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: item.ok ? '#22c55e' : '#f59e0b' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── KYC ── */}
          {activeSection === 'kyc' && (
            <div className="space-y-4">
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Identity Verification</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>KYC verification is required for all accounts. Complete your verification to unlock full trading access.</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold shrink-0" style={{ backgroundColor: kycCfg.bg, border: `1px solid ${kycCfg.border}`, color: kycCfg.color }}>
                    <kycCfg.icon size={11} />
                    {kycCfg.label}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded text-xs" style={{ backgroundColor: kycCfg.bg, border: `1px solid ${kycCfg.border}` }}>
                  <kycCfg.icon size={12} className="mt-0.5 shrink-0" style={{ color: kycCfg.color }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>{kycCfg.description}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Personal Info', done: kycStatus !== 'not_started' },
                    { label: 'Address', done: kycStatus !== 'not_started' && kycStatus !== 'in_progress' },
                    { label: 'Documents', done: ['submitted', 'under_review', 'verified'].includes(kycStatus) },
                    { label: 'Review', done: kycStatus === 'verified' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: step.done ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)' }}>
                        {step.done ? <CheckCircle size={10} style={{ color: '#22c55e' }} /> : <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 700 }}>{i + 1}</span>}
                      </div>
                      <span style={{ color: step.done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {(kycStatus === 'not_started' || kycStatus === 'in_progress' || kycStatus === 'rejected') && (
                <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <KYCVerificationFlow onComplete={() => setKycStatus('submitted')} isFirstLogin={false} />
                </div>
              )}
              {(kycStatus === 'submitted' || kycStatus === 'under_review') && (
                <div className="rounded border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Clock size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Documents Under Review</h3>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>Your identity documents have been submitted and are being reviewed by our compliance team. This typically takes 1–2 business days.</p>
                </div>
              )}
              {kycStatus === 'verified' && (
                <div className="rounded border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle size={20} style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Identity Verified</h3>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>Your identity has been successfully verified. Full account access is enabled.</p>
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="rounded border p-4 sm:p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Lock size={15} style={{ color: 'var(--primary)' }} />
                  <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Change Password</h2>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Passwords are transmitted over HTTPS and stored using Argon2id hashing. Never share your password.</p>
                {pwError && <div className="p-3 rounded text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>{pwError}</div>}
                {pwSaved && <div className="flex items-center gap-2 p-3 rounded text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}><Check size={12} /> Password updated successfully</div>}
                <div className="space-y-3">
                  {[
                    { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCurrentPw, toggle: () => setShowCurrentPw(!showCurrentPw), auto: 'current-password' },
                    { label: 'New Password', val: newPw, set: setNewPw, show: showNewPw, toggle: () => setShowNewPw(!showNewPw), auto: 'new-password' },
                    { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw, show: showConfirmPw, toggle: () => setShowConfirmPw(!showConfirmPw), auto: 'new-password' },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{field.label}</label>
                      <div className="relative">
                        <input type={field.show ? 'text' : 'password'} value={field.val} onChange={e => field.set(e.target.value)} autoComplete={field.auto} className={`${inputCls} pr-10`} style={inputStyle} />
                        <button onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>{field.show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handlePasswordChange} className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Update Password</button>
              </div>

              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.1)' }}>
                      <Smartphone size={15} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Add an extra layer of security using a TOTP authenticator app (e.g. Google Authenticator, Authy).</p>
                      <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded font-semibold`} style={{ backgroundColor: twoFaEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: twoFaEnabled ? '#22c55e' : '#ef4444' }}>
                        {twoFaEnabled ? '● Enabled' : '● Disabled'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setTwoFaEnabled(!twoFaEnabled)} className="px-3 py-1.5 rounded text-xs font-semibold border transition-all hover:bg-muted shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    {twoFaEnabled ? 'Disable' : 'Enable 2FA'}
                  </button>
                </div>
              </div>

              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Key size={15} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>API Keys</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>API keys allow programmatic access to your account. Keep them secret.</p>
                <div className="rounded border p-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Main API Key</p>
                    <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>tc_••••••••••••••••••••••••••••••••</p>
                  </div>
                  <button className="text-xs px-2 py-1 rounded border transition-all hover:bg-muted shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Reveal</button>
                </div>
                <button className="mt-3 text-xs px-3 py-1.5 rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>+ Generate New Key</button>
              </div>
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {activeSection === 'preferences' && (
            <div className="rounded border p-4 sm:p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Preferences</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>These settings will be persisted to your account once backend preferences are available.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Language</label>
                  <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Time Zone</label>
                  <select value={prefs.timezone} onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))} className={inputCls} style={inputStyle}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Display Currency</label>
                  <select value={prefs.displayCurrency} onChange={e => setPrefs(p => ({ ...p, displayCurrency: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Number Formatting</label>
                  <select value={prefs.numberFormat} onChange={e => setPrefs(p => ({ ...p, numberFormat: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    <option value="en-US">1,234,567.89 (US)</option>
                    <option value="de-DE">1.234.567,89 (EU)</option>
                    <option value="fr-FR">1 234 567,89 (FR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Market Default View</label>
                  <select value={prefs.marketDefaultView} onChange={e => setPrefs(p => ({ ...p, marketDefaultView: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    <option value="all">All Markets</option>
                    <option value="forex">Forex</option>
                    <option value="crypto">Cryptocurrencies</option>
                    <option value="indices">Indices</option>
                    <option value="commodities">Commodities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Default Chart Type</label>
                  <select value={prefs.chartType} onChange={e => setPrefs(p => ({ ...p, chartType: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    <option value="candlestick">Candlestick</option>
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="area">Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Default Chart Interval</label>
                  <select value={prefs.chartInterval} onChange={e => setPrefs(p => ({ ...p, chartInterval: e.target.value as any }))} className={inputCls} style={inputStyle}>
                    {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Display Options</h3>
                {[
                  { label: 'Show P&L in header', key: 'showPnlInHeader' as const },
                  { label: 'Compact table rows', key: 'compactTables' as const },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{opt.label}</span>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                      className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0"
                      style={{ backgroundColor: prefs[opt.key] ? 'var(--primary)' : 'var(--muted)' }}
                    >
                      <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200" style={{ backgroundColor: prefs[opt.key] ? '#000' : 'var(--muted-foreground)', left: prefs[opt.key] ? '22px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                {prefsSaved && <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--positive)' }}><Check size={13} /> Preferences saved</div>}
                <div className="flex-1" />
                <button onClick={handleSavePrefs} className="px-4 py-2 rounded text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <div className="rounded border p-4 sm:p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notification Preferences</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Control which events trigger notifications for your account.</p>
              </div>
              {[
                { key: 'tradeExecutions' as const, label: 'Trade Executions', desc: 'Get notified when your orders are filled or cancelled' },
                { key: 'priceAlerts' as const, label: 'Price Alerts', desc: 'Receive alerts when assets hit your target price' },
                { key: 'deposits' as const, label: 'Deposits & Withdrawals', desc: 'Notifications for all fund movements' },
                { key: 'security' as const, label: 'Security Alerts', desc: 'Login attempts, password changes, and security events' },
                { key: 'support' as const, label: 'Support Messages', desc: 'New replies from your support agent' },
                { key: 'dividends' as const, label: 'Dividend Updates', desc: 'Eligibility reviews and claim status updates' },
                { key: 'promotions' as const, label: 'Promotions & Announcements', desc: 'Platform updates and promotional offers' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-b-0 gap-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0"
                    style={{ backgroundColor: notifPrefs[item.key] ? 'var(--primary)' : 'var(--muted)' }}
                  >
                    <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200" style={{ backgroundColor: notifPrefs[item.key] ? '#000' : 'var(--muted-foreground)', left: notifPrefs[item.key] ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── PROGRAMS & BENEFITS ── */}
          {activeSection === 'programs' && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Programs &amp; Benefits</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Account programs and financial services available to eligible Trade Console customers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Gift, title: 'Deposit Bonus', desc: 'Receive additional account credit on qualifying promotional deposits.', color: 'var(--primary)', href: '/programs' },
                  { icon: Users, title: 'Referral Program', desc: 'Invite clients and earn rewards when they qualify under program terms.', color: '#22c55e', href: '/programs' },
                  { icon: TrendingUp, title: 'Crypto Lending', desc: 'Allocate eligible cryptocurrency to approved lending programs.', color: '#3b82f6', href: '/programs' },
                  { icon: Award, title: 'Dividend Program', desc: 'Eligible customers may participate in configured dividend programs.', color: 'var(--primary)', href: '/settings?tab=dividend' },
                ].map((card, i) => (
                  <a
                    key={i}
                    href={card.href}
                    className="flex items-start gap-3 p-4 rounded border transition-all hover:shadow-sm hover:border-primary/30 group"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none' }}
                  >
                    <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${card.color}14`, border: `1px solid ${card.color}30` }}>
                      <card.icon size={16} style={{ color: card.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{card.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{card.desc}</p>
                    </div>
                    <ChevronDown size={13} className="-rotate-90 shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--muted-foreground)' }} />
                  </a>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
                <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--muted-foreground)' }}>Program availability, eligibility, and terms are subject to jurisdiction, account status, and platform configuration. All financial values are backend-authoritative.</p>
              </div>
            </div>
          )}

          {/* ── DIVIDEND ── */}
          {activeSection === 'dividend' && <DividendSection employmentStatus={employmentStatus} />}

          {/* ── DOCUMENTS ── */}
          {activeSection === 'documents' && (
            <div className="space-y-4">
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Documents</h2>
                <div className="space-y-2">
                  {[
                    { name: 'Account Agreement', date: 'Aug 2026', status: 'Signed', type: 'PDF' },
                    { name: 'Risk Disclosure', date: 'Aug 2026', status: 'Signed', type: 'PDF' },
                    { name: 'Privacy Policy', date: 'Aug 2026', status: 'Accepted', type: 'PDF' },
                    { name: 'Terms of Service', date: 'Aug 2026', status: 'Accepted', type: 'PDF' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-b-0 gap-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                          <FileText size={13} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{doc.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{doc.type} · {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{doc.status}</span>
                        <button className="text-xs px-2 py-1 rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>KYC Documents</h3>
                {kycStatus === 'verified' ? (
                  <div className="space-y-2">
                    {[
                      { name: 'Passport / ID', status: 'Verified', date: 'Aug 2026' },
                      { name: 'Proof of Address', status: 'Verified', date: 'Aug 2026' },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{doc.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{doc.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileCheck size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No KYC documents uploaded yet.</p>
                    <button onClick={() => setActiveSection('kyc')} className="mt-3 text-xs px-3 py-1.5 rounded font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Complete Verification</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SESSIONS & LOGIN ACTIVITY ── */}
          {activeSection === 'sessions' && (
            <div className="space-y-4">
              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor size={15} style={{ color: 'var(--primary)' }} />
                    <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Active Sessions</h2>
                  </div>
                  <button onClick={revokeAllOther} className="text-xs hover:underline" style={{ color: 'var(--negative)' }}>Sign out all other sessions</button>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Devices currently signed in to your account.</p>
                <div className="space-y-0">
                  {sessions.map(session => (
                    <div key={session.id} className="py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--muted)' }}>
                            <Monitor size={13} style={{ color: 'var(--muted-foreground)' }} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{session.device}</p>
                              {session.current && <span className="text-xs px-1.5 py-0.5 rounded font-semibold text-positive shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>Current</span>}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}><MapPin size={10} /> {session.location}</span>
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}><Clock size={10} /> {session.lastActive}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Created: {session.created}</span>
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Expires: {session.expires}</span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <button onClick={() => revokeSession(session.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-all hover:bg-muted shrink-0" style={{ borderColor: 'var(--negative)', color: 'var(--negative)' }}>
                            <LogOut size={11} /> Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border p-4 sm:p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <History size={15} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Login Activity</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Recent sign-in attempts to your account.</p>
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
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--foreground)' }}>{entry.date}</td>
                          <td className="py-2.5 pr-3 truncate max-w-[120px]" style={{ color: 'var(--foreground)' }}>{entry.device}</td>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--muted-foreground)' }}>{entry.browser}</td>
                          <td className="py-2.5 pr-3" style={{ color: 'var(--muted-foreground)' }}>{entry.location}</td>
                          <td className="py-2.5">
                            {entry.result === 'success'
                              ? <span className="px-1.5 py-0.5 rounded text-positive font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>Success</span>
                              : <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--negative)' }}><AlertTriangle size={10} /> Failed</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── DIVIDEND SECTION ──
function DividendSection({ employmentStatus }: { employmentStatus: EmploymentStatus }) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimStep, setClaimStep] = useState(1);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const eligibilityStatus: DividendEligibilityStatus = 'not_evaluated';
  const statusCfg = DIVIDEND_STATUS_CONFIG[eligibilityStatus];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Eligibility Status', value: statusCfg.label, color: statusCfg.color },
          { label: 'Available Claim', value: '—', color: 'var(--muted-foreground)' },
          { label: 'Next Review', value: '—', color: 'var(--muted-foreground)' },
          { label: 'Total Paid', value: '$0.00', color: 'var(--foreground)' },
          { label: 'Last Payment', value: '—', color: 'var(--muted-foreground)' },
          { label: 'Employment Status', value: employmentStatus.replace('_', ' '), color: 'var(--foreground)' },
        ].map((card, i) => (
          <div key={i} className="rounded border p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
            <p className="text-sm font-semibold mt-1 capitalize" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Eligibility info */}
      <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,168,0,0.1)' }}>
            <Award size={15} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Dividend / Benefit Programs</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Eligibility for dividend and benefit programs is determined by the platform based on account classification, employment status, and administrative authorization. The platform does not automatically grant entitlements.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded mb-4" style={{ backgroundColor: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.15)' }}>
          <Info size={12} className="mt-0.5 shrink-0" style={{ color: '#6b7280' }} />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Your account eligibility status is currently <strong>Not Evaluated</strong>. If you believe you may qualify for a benefit program, contact your account manager or support team to request a review.
          </p>
        </div>

        <div className="rounded border p-4 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
          <Award size={20} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No dividend claim is currently available for this account.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Eligibility is reviewed periodically based on account activity and classification.</p>
        </div>
      </div>

      {/* Eligibility states reference */}
      <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Eligibility Status Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(DIVIDEND_STATUS_CONFIG) as [DividendEligibilityStatus, typeof DIVIDEND_STATUS_CONFIG[DividendEligibilityStatus]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 px-2.5 py-2 rounded text-xs" style={{ backgroundColor: cfg.bg }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              <span style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Claim history */}
      <div className="rounded border p-4 sm:p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Claim History</h3>
        <div className="text-center py-6">
          <History size={20} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No claim history available.</p>
        </div>
      </div>
    </div>
  );
}
