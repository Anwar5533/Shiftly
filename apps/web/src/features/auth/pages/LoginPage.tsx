import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useAppDispatch } from '@/app/store';
import { setUser } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '@/shared/lib/api';
import { jwtDecode } from '../utils/jwt';
import type { JwtPayload } from '@shiftly/shared-types';

// ─── Form schemas ──────────────────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Enter phone with country code (e.g. +91...)'),
});

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type LoginMode = 'phone' | 'email';

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<LoginMode>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  // ─── Phone form ──────────────────────────────────────────────────────
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '+91' },
  });

  // ─── Email form ──────────────────────────────────────────────────────
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  // ─── Mutations ───────────────────────────────────────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
    onSuccess: (_data, phone) => {
      navigate('/verify-otp', { state: { phone } });
    },
  });

  const loginEmailMutation = useMutation({
    mutationFn: (data: EmailForm) => authApi.loginEmail(data.email, data.password),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      const payload = jwtDecode<JwtPayload>(data.accessToken);
      dispatch(setUser(payload));
      navigate(from, { replace: true });
    },
  });

  const handlePhoneSubmit = (data: PhoneForm): void => {
    // Normalise phone: ensure + prefix
    const phone = data.phone.startsWith('+') ? data.phone : `+${data.phone}`;
    sendOtpMutation.mutate(phone);
  };

  const handleEmailSubmit = (data: EmailForm): void => {
    loginEmailMutation.mutate(data);
  };

  const serverError =
    (sendOtpMutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
    (loginEmailMutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to continue to SHIFTLY
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-border p-1 gap-1 bg-muted/50">
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
            mode === 'phone'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone OTP
        </button>
        <button
          type="button"
          onClick={() => setMode('email')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
            mode === 'email'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>

      {/* Forms */}
      <AnimatePresence mode="wait">
        {mode === 'phone' ? (
          <motion.form
            key="phone-form"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
            className="space-y-4"
            aria-label="Phone OTP login form"
            noValidate
          >
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  autoFocus
                  placeholder="+91 98765 43210"
                  className="input-glow w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...phoneForm.register('phone')}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-xs text-destructive" role="alert">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {serverError && mode === 'phone' && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={sendOtpMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {sendOtpMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              We'll send a 6-digit code to verify your number
            </p>
          </motion.form>
        ) : (
          <motion.form
            key="email-form"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-4"
            aria-label="Email login form"
            noValidate
          >
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="name@company.com"
                  className="input-glow w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-glow w-full rounded-lg border border-input bg-background px-4 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                  {...emailForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {emailForm.formState.errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {serverError && mode === 'email' && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginEmailMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">New to SHIFTLY?</span>
        </div>
      </div>

      {/* Register link */}
      <Link
        to="/register"
        className="flex items-center justify-center w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Create an account
      </Link>
    </div>
  );
}
