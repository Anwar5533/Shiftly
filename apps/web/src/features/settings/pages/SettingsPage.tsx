import React, { useState } from 'react';
import { Bell, Lock, User, CreditCard, Shield } from 'lucide-react';
import { useAppSelector } from '@/app/store';

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
    marketing: false
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleSaveAccount = () => {
    // Simulate save
    alert('Account settings saved successfully!');
  };

  const handleToggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Update your primary contact email.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Language</p>
                        <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                      </div>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="p-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
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
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email', title: 'Email Notifications', desc: 'Receive updates via email' },
                    { id: 'sms', title: 'SMS Notifications', desc: 'Get important alerts via text message' },
                    { id: 'push', title: 'Push Notifications', desc: 'Receive notifications on your device' },
                    { id: 'marketing', title: 'Marketing Emails', desc: 'Receive news, special offers, and updates' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationPrefs[item.id as keyof typeof notificationPrefs]}
                          onChange={() => handleToggleNotification(item.id as keyof typeof notificationPrefs)}
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
                <div className="p-4 border border-border rounded-xl flex items-start gap-4 bg-muted/30">
                  <Shield className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Add an extra layer of security to your account by requiring more than just your password to sign in.</p>
                    <button 
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        alert(twoFactorEnabled ? '2FA Disabled' : '2FA Enabled');
                      }}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm ${twoFactorEnabled ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-background border border-input text-foreground hover:bg-muted'}`}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-3">Change Password</h4>
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                    <input type="password" required placeholder="Current Password" className="w-full p-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                    <input type="password" required placeholder="New Password" className="w-full p-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                    <input type="password" required placeholder="Confirm New Password" className="w-full p-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                    <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Billing & Payments</h3>
                <div className="p-8 text-center bg-muted/50 rounded-xl border border-dashed border-border">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">No payment methods found</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Add a payment method to streamline your future transactions.</p>
                  <button 
                    onClick={() => alert('Add Payment Method modal would open here')}
                    className="px-4 py-2 bg-background border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors text-sm shadow-sm"
                  >
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
