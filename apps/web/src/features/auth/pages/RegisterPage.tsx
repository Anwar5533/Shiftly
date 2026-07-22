import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, UserCircle, Building2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useAppDispatch } from '@/app/store';
import { setUser } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '@/shared/lib/api';
import { jwtDecode } from '../utils/jwt';
import type { JwtPayload, UserRole } from '@shiftly/shared-types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<UserRole>('WORKER');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: role,
      }),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      const payload = jwtDecode<JwtPayload>(data.accessToken);
      dispatch(setUser(payload));
      void navigate('/onboarding', { replace: true });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    void registerMutation.mutate(data);
  };

  const serverError = (
    registerMutation.error as import('axios').AxiosError<{ error?: { message?: string } }>
  )?.response?.data?.error?.message;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground">Join SHIFTLY to find work or hire talent</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('WORKER')}
          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200 ${
            role === 'WORKER'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50'
          }`}
        >
          <UserCircle className="mb-2 h-6 w-6" />
          <span className="text-sm font-semibold">I'm a Worker</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('EMPLOYER')}
          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200 ${
            role === 'EMPLOYER' || role === 'RECRUITER'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50'
          }`}
        >
          <Building2 className="mb-2 h-6 w-6" />
          <span className="text-sm font-semibold">I'm an Employer</span>
        </button>
      </div>

      {/* Register Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First name
            </label>
            <input
              id="firstName"
              placeholder="John"
              className="input-glow w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last name
            </label>
            <input
              id="lastName"
              placeholder="Doe"
              className="input-glow w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="input-glow w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="input-glow w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="px-4 text-center text-xs text-muted-foreground">
          By clicking create account, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          to="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
