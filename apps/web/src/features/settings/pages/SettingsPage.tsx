import React, { useState } from 'react';
import { Bell, Lock, User, CreditCard, Shield, Gift, Copy, Check } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../api/referrals.api';
export default function SettingsPage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('account');
  const [language, setLanguage] = useState('English (India)');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    push: false,
    marketing: false,
  });

  const { data: refCode } = useQuery({
    queryKey: ['referral-code'],
    queryFn: referralsApi.getReferralCode,
    enabled: activeTab === 'referrals',
  });

  const { data: refStats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: referralsApi.getReferralStats,
    enabled: activeTab === 'referrals',
  });

  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
    if (refCode) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
      navigator.clipboard.writeText(refCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'referrals', label: 'Referrals', icon: <Gift className="h-4 w-4" /> },
  ];

  const handleSaveAccount = () => {
    // Simulate save
    alert('Account settings saved successfully!');
  };

  const handleToggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password updated successfully!');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full space-y-1 md:w-64">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="min-h-[400px] rounded-2xl border border-border bg-card p-6 shadow-sm">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Update your primary contact email.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Language</p>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language.
                        </p>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option>English (India)</option>
                        <option>Kannada</option>
                        <option>Telugu</option>
                        <option>Tamil</option>
                        <option>Malayalam</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveAccount}
                    className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      id: 'email',
                      title: 'Email Notifications',
                      desc: 'Receive updates via email',
                    },
                    {
                      id: 'sms',
                      title: 'SMS Notifications',
                      desc: 'Get important alerts via text message',
                    },
                    {
                      id: 'push',
                      title: 'Push Notifications',
                      desc: 'Receive notifications on your device',
                    },
                    {
                      id: 'marketing',
                      title: 'Marketing Emails',
                      desc: 'Receive news, special offers, and updates',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/50 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={notificationPrefs[item.id as keyof typeof notificationPrefs]}
                          onChange={() =>
                            handleToggleNotification(item.id as keyof typeof notificationPrefs)
                          }
                        />
                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Security Settings</h3>
                <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <Shield className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="mb-3 mt-1 text-sm text-muted-foreground">
                      Add an extra layer of security to your account by requiring more than just
                      your password to sign in.
                    </p>
                    <button
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        alert(twoFactorEnabled ? '2FA Disabled' : '2FA Enabled');
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${twoFactorEnabled ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'border border-input bg-background text-foreground hover:bg-muted'}`}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-medium text-foreground">Change Password</h4>
                  <form onSubmit={handleChangePassword} className="max-w-sm space-y-3">
                    <input
                      type="password"
                      required
                      placeholder="Current Password"
                      className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="password"
                      required
                      placeholder="New Password"
                      className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Confirm New Password"
                      className="w-full rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Billing & Payments</h3>
                <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
                  <CreditCard className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium text-foreground">No payment methods found</p>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    Add a payment method to streamline your future transactions.
                  </p>
                  <button
                    onClick={() => alert('Add Payment Method modal would open here')}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Refer & Earn</h3>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-foreground">
                      {refStats ? `${refStats.totalEarned} ${refStats.currency}` : '...'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold text-foreground">
                      {refStats?.totalReferrals ?? '...'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Active Referrals</p>
                    <p className="text-2xl font-bold text-foreground">
                      {refStats?.activeReferrals ?? '...'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <h4 className="mb-2 font-medium text-foreground">Your Referral Code</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Share this code with your friends and earn a bonus when they sign up and
                    complete their first shift.
                  </p>
                  <div className="flex max-w-sm items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={refCode?.code || 'Loading...'}
                      className="w-full rounded-md border border-input bg-background p-2.5 text-center font-mono tracking-wider text-foreground"
                    />
                    <button
                      onClick={handleCopyCode}
                      className="rounded-md bg-primary p-2.5 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
