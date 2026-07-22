/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { clearUser } from '@/features/auth/store/authSlice';
import { authApi } from '@/features/auth/api/auth.api';
import { clearAccessToken } from '@/shared/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  LogOut,
  Briefcase,
  UserCircle,
  Bell,
  Settings,
  Search,
  Menu,
  Moon,
  Sun,
  Laptop,
  ArrowLeft,
  Wallet,
  X,
  FileText,
  Clock,
  PlusCircle,
  Users,
  CreditCard,
  BarChart,
  Activity,
  DollarSign,
  ChevronDown,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { setTheme } from '@/shared/store/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { workerApi } from '@/features/profile/api/worker.api';
import { employerApi } from '@/features/profile/api/employer.api';
import { recruiterApi } from '@/features/profile/api/recruiter.api';

export function DashboardLayout(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<string>(
    () => localStorage.getItem('activePortal') || user?.role.toLowerCase() || 'worker',
  );

  const { data: workerProfile } = useQuery({
    queryKey: ['worker-profile', user?.sub],
    queryFn: () => workerApi.getProfile(),
    enabled: user?.role === 'WORKER',
    staleTime: 5 * 60 * 1000,
  });

  const { data: employerProfile } = useQuery({
    queryKey: ['employer-profile', user?.sub],
    queryFn: () => employerApi.getProfile(),
    enabled: user?.role === 'EMPLOYER',
    staleTime: 5 * 60 * 1000,
  });

  const { data: recruiterProfile } = useQuery({
    queryKey: ['recruiter-profile', user?.sub],
    queryFn: () => recruiterApi.getProfile(),
    enabled: user?.role === 'RECRUITER',
    staleTime: 5 * 60 * 1000,
  });

  const userProfile = workerProfile || employerProfile || recruiterProfile;

  const getInitials = () => {
    if (userProfile) {
      if (user?.role === 'EMPLOYER') return (userProfile as unknown as Record<string, string>).companyName?.[0] || 'C';
      const profile = userProfile as unknown as Record<string, string>;
      const first = profile.firstName?.[0] || '';
      const last = profile.lastName?.[0] || '';
      if (first || last) return `${first}${last}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (userProfile) {
      if (user?.role === 'EMPLOYER') return (userProfile as unknown as Record<string, string>).companyName || 'Company';
      const profile = userProfile as unknown as Record<string, string>;
      const first = profile.firstName || '';
      const last = profile.lastName || '';
      if (first || last) return `${first} ${last}`.trim();
    }
    return user?.email || 'User';
  };

  React.useEffect(() => {
    if (location.pathname.startsWith('/dashboard/')) {
      const portal = location.pathname.split('/')[2];
      if (portal) {
        localStorage.setItem('activePortal', portal);
      }
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_error) {
      const err = _error as import('axios').AxiosError<Record<string, unknown>>;
      // Ignore API error on logout
    } finally {
      clearAccessToken();
      dispatch(clearUser());
      void navigate('/login', { replace: true });
    }
  };

  const baseItems = [
    { label: 'AI Assistant', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
    {
      label: 'Profile',
      path: `/profile/${user?.role.toLowerCase()}/${user?.sub}`,
      icon: <UserCircle className="h-5 w-5" />,
    },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  let navItems: { label: string; path: string; icon: React.ReactNode }[];
  switch (activePortal) {
    case 'employer':
      navItems = [
        {
          label: 'Dashboard',
          path: '/dashboard/employer',
          icon: <Briefcase className="h-5 w-5" />,
        },
        { label: 'Post a Job', path: '/jobs/post', icon: <PlusCircle className="h-5 w-5" /> },
        { label: 'Manage Jobs', path: '/jobs/manage', icon: <FileText className="h-5 w-5" /> },
        { label: 'Applicants', path: '/applicants', icon: <Users className="h-5 w-5" /> },
        {
          label: 'Timesheet Approvals',
          path: '/timesheet-approvals',
          icon: <CheckCircle className="h-5 w-5" />,
        },
        { label: 'Billing', path: '/billing', icon: <CreditCard className="h-5 w-5" /> },
        ...baseItems,
      ];
      break;
    case 'recruiter':
      navItems = [
        {
          label: 'Dashboard',
          path: '/dashboard/recruiter',
          icon: <Briefcase className="h-5 w-5" />,
        },
        { label: 'Find Candidates', path: '/candidates', icon: <Search className="h-5 w-5" /> },
        {
          label: 'Requisitions',
          path: '/jobs/requisitions',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          label: 'Timesheet Approvals',
          path: '/timesheet-approvals',
          icon: <CheckCircle className="h-5 w-5" />,
        },
        { label: 'Wallet', path: '/wallet', icon: <Wallet className="h-5 w-5" /> },
        ...baseItems,
      ];
      break;
    case 'admin':
      navItems = [
        { label: 'Dashboard', path: '/dashboard/admin', icon: <Briefcase className="h-5 w-5" /> },
        { label: 'User Management', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart className="h-5 w-5" /> },
        { label: 'System Logs', path: '/admin/logs', icon: <Activity className="h-5 w-5" /> },
        {
          label: 'Financials',
          path: '/admin/financials',
          icon: <DollarSign className="h-5 w-5" />,
        },
        ...baseItems,
      ];
      break;
    default:
      navItems = [
        { label: 'Dashboard', path: '/dashboard/worker', icon: <Briefcase className="h-5 w-5" /> },
        { label: 'Find Jobs', path: '/jobs', icon: <Search className="h-5 w-5" /> },
        {
          label: 'My Applications',
          path: '/applications/my',
          icon: <FileText className="h-5 w-5" />,
        },
        { label: 'Timesheets', path: '/timesheets', icon: <Clock className="h-5 w-5" /> },
        { label: 'Wallet', path: '/wallet', icon: <Wallet className="h-5 w-5" /> },
        ...baseItems,
      ];
      break;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center space-x-3 p-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-brand">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">SHIFTLY</span>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch(setTheme('light'))}
                className={`rounded-md p-1.5 ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(setTheme('dark'))}
                className={`rounded-md p-1.5 ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(setTheme('system'))}
                className={`rounded-md p-1.5 ${theme === 'system' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Laptop className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={() => { void handleLogout(); }}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar (Mobile Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-brand">
                    <span className="text-lg font-bold text-primary-foreground">S</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">SHIFTLY</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="-mr-2 p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 flex-1 space-y-1 px-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto p-4">
                <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => dispatch(setTheme('light'))}
                      className={`rounded-md p-1.5 ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => dispatch(setTheme('dark'))}
                      className={`rounded-md p-1.5 ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => dispatch(setTheme('system'))}
                      className={`rounded-md p-1.5 ${theme === 'system' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Laptop className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => { void handleLogout(); }}
                  className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/70 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="-ml-2 mr-2 p-2 text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Universal Back Button (Hidden ONLY on the main dashboard home pages) */}
            {!(
              location.pathname === '/dashboard' ||
              location.pathname === '/dashboard/worker' ||
              location.pathname === '/dashboard/employer' ||
              location.pathname === '/dashboard/recruiter' ||
              location.pathname === '/dashboard/admin' ||
              location.pathname === '/'
            ) && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden text-sm font-medium md:inline">Back</span>
              </button>
            )}

            <span className="ml-4 text-lg font-bold md:hidden">SHIFTLY</span>
            <div className="ml-4 hidden items-center border-l border-border pl-4 md:flex">
              <select
                className="cursor-pointer bg-transparent text-sm font-medium capitalize text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                value={activePortal}
                onChange={(e) => {
                  const newPortal = e.target.value;
                  localStorage.setItem('activePortal', newPortal);
                  setActivePortal(newPortal);
                  void navigate(`/dashboard/${newPortal}`);
                }}
              >
                <option value="worker">Worker Portal</option>
                <option value="employer">Employer Portal</option>
                <option value="recruiter">Recruiter Portal</option>
                <option value="admin">Admin Portal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-destructive"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card py-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        2 New
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      <div className="cursor-pointer border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50">
                        <p className="text-sm font-medium text-foreground">
                          Your shift was approved
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Amazon Fulfillment • 2 hours ago
                        </p>
                      </div>
                      <div className="cursor-pointer border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50">
                        <p className="text-sm font-medium text-foreground">
                          New job match: Forklift Operator
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Home Depot • 5 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          void navigate('/notifications');
                        }}
                        className="w-full rounded-md px-4 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-primary/30 bg-primary/20 transition-all hover:ring-2 hover:ring-primary/50">
                  <span className="text-sm font-semibold uppercase text-primary">
                    {getInitials()}
                  </span>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"></div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card py-2 shadow-lg"
                  >
                    <div className="mb-2 border-b border-border px-4 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                        {getInitials()}
                      </div>
                      <span className="hidden text-sm font-medium sm:block">{getFullName()}</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        void navigate(
                                                                        `/profile/${user?.role.toLowerCase() || 'worker'}/${user?.sub || 'mock-id'}`,
                                                                      );
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        void navigate('/settings');
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Settings
                    </button>

                    <div className="my-2 h-px bg-border"></div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        void handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="relative flex-1 overflow-auto bg-muted/20 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto h-full max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
