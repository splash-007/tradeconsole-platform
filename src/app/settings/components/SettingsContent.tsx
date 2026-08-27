'use client';
import React, { useState } from 'react';
import { User, Shield, Bell, Eye, EyeOff, Smartphone, Key, LogOut, Check } from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'preferences';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Eye },
];

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="py-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Settings & Security</h1>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manage your account settings and security preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0">
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b last:border-b-0 hover:bg-white/5 ${activeTab === tab.id ? 'bg-primary-subtle' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)' }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}>A</div>
                <div>
                  <button className="text-xs px-3 py-1.5 rounded border transition-all hover:bg-muted"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    Change Photo
                  </button>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'First Name', value: 'Alex', placeholder: 'First name' },
                  { label: 'Last Name', value: 'Morgan', placeholder: 'Last name' },
                  { label: 'Email Address', value: 'alex.morgan@email.com', placeholder: 'Email', colSpan: true },
                  { label: 'Phone Number', value: '+1 (555) 000-0000', placeholder: 'Phone' },
                  { label: 'Country', value: 'United States', placeholder: 'Country' },
                ].map((field, idx) => (
                  <div key={`pf-${idx}`} className={field.colSpan ? 'col-span-2' : ''}>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                {saved && (
                  <div className="flex items-center gap-1.5 text-xs text-positive">
                    <Check size={13} /> Changes saved
                  </div>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Change Password */}
              <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Change Password</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none pr-10"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
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
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none pr-10"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                      <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  Update Password
                </button>
              </div>

              {/* 2FA */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.12)' }}>
                      <Smartphone size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        Add an extra layer of security to your account using an authenticator app.
                      </p>
                      <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold ${twoFaEnabled ? 'text-positive' : 'text-negative'}`}
                        style={{ backgroundColor: twoFaEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                        {twoFaEnabled ? '● Enabled' : '● Disabled'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-muted"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {twoFaEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* API Keys */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Key size={16} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>API Keys</h3>
                </div>
                <div className="rounded-lg border p-3 flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Main API Key</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted-foreground)' }}>cv_••••••••••••••••••••••••••••••••</p>
                  </div>
                  <button className="text-xs px-2 py-1 rounded border transition-all hover:bg-muted"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    Reveal
                  </button>
                </div>
                <button className="mt-3 text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-muted"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  + Generate New Key
                </button>
              </div>

              {/* Active Sessions */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Active Sessions</h3>
                  <button className="text-xs text-negative hover:underline">Revoke All</button>
                </div>
                {[
                  { device: 'Chrome on macOS', ip: '192.168.1.1', time: 'Current session', current: true },
                  { device: 'Safari on iPhone', ip: '192.168.1.2', time: '2 hours ago', current: false },
                ].map((session, idx) => (
                  <div key={`sess-${idx}`} className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
                        <Smartphone size={14} style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{session.device}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{session.ip} · {session.time}</p>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-positive" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>Current</span>
                    ) : (
                      <button className="text-xs text-negative hover:underline">
                        <LogOut size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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
            <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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
                      className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      {pref.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
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
    <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div>
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
