import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { motion } from 'framer-motion';

export function AuthLayout(): React.ReactElement {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Hide back button on the main login screen
  const isMainLogin = location.pathname === '/login';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 sm:p-12">
      {!isMainLogin && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden text-sm font-medium sm:inline">Back</span>
        </button>
      )}
      {/* Subtle Background Effects */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-brand-300/5 blur-3xl" />

      {/* Logo */}
      <div className="z-10 mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-brand">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">SHIFTLY</span>
      </div>

      {/* Auth Form Container */}
      <motion.div
        className="z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
