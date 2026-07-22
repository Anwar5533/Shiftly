import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/app/store';
import { setUser } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '@/shared/lib/api';
import { jwtDecode } from '../utils/jwt';
import type { JwtPayload } from '@shiftly/shared-types';

export default function OtpPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const phone = (location.state as { phone?: string })?.phone;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If accessed directly without phone, send back to login
  if (!phone) {
    return <Navigate to="/login" replace />;
  }

  // ─── Countdown Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  // ─── Mutations ─────────────────────────────────────────────────────────
  const verifyOtpMutation = useMutation({
    mutationFn: (code: string) => authApi.verifyOtp(phone, code),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      const payload = jwtDecode<JwtPayload>(data.accessToken);
      dispatch(setUser(payload));

      if (data.isNewUser) {
        void navigate('/register', { replace: true });
      } else {
        void navigate('/dashboard', { replace: true });
      }
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => authApi.sendOtp(phone),
    onSuccess: () => {
      setCountdown(30);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are pasted/typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];

    pastedData.forEach((char, i) => {
      if (/^\d$/.test(char) && i < 6) {
        newOtp[i] = char;
      }
    });

    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      void verifyOtpMutation.mutate(code);
    }
  };

  const serverError = (verifyOtpMutation.error as import('axios').AxiosError<{error?: {message?: string}}>)?.response?.data?.error?.message;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="mb-4 flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to login
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify your number</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-semibold text-foreground">{phone}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="OTP Verification form">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="input-glow h-14 w-12 rounded-lg border border-input bg-background text-center text-xl font-bold text-foreground transition-all focus:border-ring focus:outline-none"
              autoFocus={index === 0}
              disabled={verifyOtpMutation.isPending}
            />
          ))}
        </div>

        {serverError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={otp.join('').length !== 6 || verifyOtpMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Logic */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Didn't receive the code? </span>
        {countdown > 0 ? (
          <span className="font-medium text-foreground">Resend in {countdown}s</span>
        ) : (
          <button
            onClick={() => { void resendOtpMutation.mutate(); }}
            disabled={resendOtpMutation.isPending}
            className="font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
          >
            {resendOtpMutation.isPending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </div>
  );
}
