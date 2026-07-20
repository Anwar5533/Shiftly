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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 bg-background relative overflow-hidden">
      {!isMainLogin && (
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium text-sm">Back</span>
        </button>
      )}
      {/* Subtle Background Effects */}
      <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-brand-300/5 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-brand">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">SHIFTLY</span>
      </div>

      {/* Auth Form Container */}
      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
