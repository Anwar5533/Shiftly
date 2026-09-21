import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { Navigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  Key,
  Mail,
  Phone,
  Activity,
  Clock,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { authApi } from '@/features/auth/api/auth.api';
import { updateUser } from '@/features/auth/store/authSlice';
import WorkerProfilePage from './WorkerProfilePage';
import EmployerProfilePage from './EmployerProfilePage';
import RecruiterProfilePage from './RecruiterProfilePage';

export default function ProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isVerifyPhoneModalOpen, setIsVerifyPhoneModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [modalError, setModalError] = useState('');

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters');
      return;
    }
    setModalError('');
    setIsSubmitting(true);
    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      setIsPasswordModalOpen(false);
      setShowSuccessToast('Password updated successfully');
      setTimeout(() => setShowSuccessToast(''), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setModalError(e.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneInput) {
      setModalError('Phone number is required');
      return;
    }
    setModalError('');
    setIsSubmitting(true);
    try {
      await authApi.resendOtp({ phone: phoneInput });
      setPhoneStep(2);
      setShowSuccessToast('Verification code sent');
      setTimeout(() => setShowSuccessToast(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setModalError(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setModalError('Please enter a valid 6-digit code');
      return;
    }
    setModalError('');
    setIsSubmitting(true);
    try {
      await authApi.verifyPhone({ phone: phoneInput, otp: otpInput });
      dispatch(updateUser({ phone: phoneInput, isPhoneVerified: true }));
      setIsVerifyPhoneModalOpen(false);
      setShowSuccessToast('Phone verified successfully');
      setTimeout(() => setShowSuccessToast(''), 3000);
      setPhoneInput('');
      setOtpInput('');
      setPhoneStep(1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setModalError(e.response?.data?.message || 'Failed to verify phone');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Get active portal, default to role-based if not set
  const activePortal =
    localStorage.getItem('activePortal') || (user.role === 'EMPLOYER' ? 'employer' : 'worker');

  // Render different profile views based on user role and active portal
  if (user.role === 'WORKER') {
    return <WorkerProfilePage />;
  }

  if (user.role === 'EMPLOYER') {
    if (activePortal === 'employer') {
      return (
        <div className="space-y-12 pb-12">
          <EmployerProfilePage />
          <div className="mx-auto max-w-5xl border-t border-border" />
          <WorkerProfilePage />
        </div>
      );
    }
    // If employer is in worker portal, only show personal profile
    return <WorkerProfilePage />;
  }

  if (user.role === 'RECRUITER') {
    return <RecruiterProfilePage />;
  }

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user.role === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Admin Dashboard'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your system credentials and access levels.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Core Identity */}
          <div className="space-y-6 lg:col-span-1">
            <div className="glass-panel flex flex-col items-center p-6 text-center">
              <div className="relative mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/30 to-primary/5">
                <span className="text-5xl font-bold uppercase text-primary">
                  {user.email ? user.email.charAt(0) : 'A'}
                </span>
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-background">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-success" />
                </div>
              </div>
              <h2 className="break-all text-xl font-bold text-foreground">{user.email}</h2>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium uppercase tracking-widest text-primary">
                <Shield className="h-4 w-4" />
                {user.role.replace('_', ' ')}
              </p>

              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1 font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3 text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold text-foreground">
                    {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Security Section */}
            <div className="glass-panel card-hover p-6">
              <h3 className="mb-6 flex items-center gap-2 border-b border-border/50 pb-4 text-lg font-semibold text-foreground">
                <Key className="h-5 w-5 text-primary" />
                Security & Verification
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-foreground">Email Address</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone Number</p>
                      <p className="text-sm text-muted-foreground">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  {user.phone ? (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsVerifyPhoneModalOpen(true)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Add / Verify Phone
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed recently</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="shrink-0 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="glass-panel card-hover p-6">
              <h3 className="mb-6 flex items-center gap-2 border-b border-border/50 pb-4 text-lg font-semibold text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Recent System Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: 'Logged into Admin Portal', time: 'Just now', ip: '192.168.1.1' },
                  {
                    action: 'Updated system configurations',
                    time: '2 hours ago',
                    ip: '192.168.1.1',
                  },
                  { action: 'Reviewed flagged job posting', time: 'Yesterday', ip: '192.168.1.1' },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between border-l-2 border-primary/30 pl-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">IP: {log.ip}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {log.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Modals and Toasts */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50 rounded-xl border border-success bg-success/10 px-4 py-3 font-medium text-success shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {showSuccessToast}
              </div>
            </motion.div>
          )}

          {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">Update Password</h3>
                  <button
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  {modalError && (
                    <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                      {modalError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${confirmPassword && confirmPassword !== newPassword ? 'border-destructive focus:ring-destructive/30' : 'border-input'}`}
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="mt-1.5 text-xs text-destructive">
                          Password is not matching with the new password
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsPasswordModalOpen(false);
                        setModalError('');
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSubmitting}
                      className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-70 disabled:hover:shadow-none"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {isVerifyPhoneModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVerifyPhoneModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">Verify Phone Number</h3>
                  <button
                    onClick={() => setIsVerifyPhoneModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  {modalError && (
                    <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                      {modalError}
                    </div>
                  )}
                  {phoneStep === 1 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        We will send a one-time verification code to your phone number.
                      </p>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to {phoneInput}.
                      </p>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm tracking-widest ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsVerifyPhoneModalOpen(false);
                        setModalError('');
                        setPhoneStep(1);
                        setPhoneInput('');
                        setOtpInput('');
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={phoneStep === 1 ? handleSendOtp : handleVerifyPhone}
                      disabled={isSubmitting}
                      className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-70 disabled:hover:shadow-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : phoneStep === 1 ? (
                        'Send Code'
                      ) : (
                        'Verify Code'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="glass-panel max-w-md p-8 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">Profile Unavailable</h2>
        <p className="text-muted-foreground">
          Profile view is not fully implemented for your current role ({user.role}).
        </p>
      </div>
    </div>
  );
}
