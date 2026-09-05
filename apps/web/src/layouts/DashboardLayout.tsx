/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): */
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
  const allowedPortals = React.useMemo(() => {
    switch (user?.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return ['worker', 'employer', 'recruiter', 'admin'];
      case 'RECRUITER':
        return ['worker', 'employer', 'recruiter'];
      case 'EMPLOYER':
      case 'WORKER':
      default:
        return ['worker', 'employer'];
    }
  }, [user?.role]);

  const [activePortal, setActivePortal] = useState<string>(() => {
    const cached = localStorage.getItem('activePortal');
    const defaultPortal = user?.role.toLowerCase() || 'worker';
    return cached && allowedPortals.includes(cached) ? cached : defaultPortal;
  });

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
      if (user?.role === 'EMPLOYER')
        return (userProfile as unknown as Record<string, string>).companyName?.[0] || 'C';
      const profile = userProfile as unknown as Record<string, string>;
      const first = profile.firstName?.[0] || '';
      const last = profile.lastName?.[0] || '';
      if (first || last) return `${first}${last}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (userProfile) {
      if (user?.role === 'EMPLOYER')
        return (userProfile as unknown as Record<string, string>).companyName || 'Company';
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
    <div className="flex h-screen bg-background p-4 text-foreground overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="glass-panel hidden w-64 flex-col md:flex mr-6 mb-0 h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3 p-6 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-brand transition-transform hover:scale-105">
            <span className="text-xl font-black text-primary-foreground">S</span>
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">SHIFTLY</span>
        </div>

        <nav className="relative mt-8 flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center rounded-xl px-3 py-3 outline-none transition-all duration-200 hover:bg-muted/50 group"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-desktop"
                      className="absolute inset-0 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/15 to-primary/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex items-center space-x-3 ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                  >
                    <div className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="mb-4 flex items-center justify-between rounded-xl bg-muted/30 p-2 border border-border/50">
            <div className="flex w-full space-x-1">
              <button
                onClick={() => dispatch(setTheme('light'))}
                className={`flex-1 flex justify-center rounded-lg p-2 transition-all ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(setTheme('dark'))}
                className={`flex-1 flex justify-center rounded-lg p-2 transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(setTheme('system'))}
                className={`flex-1 flex justify-center rounded-lg p-2 transition-all ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title="System Theme"
              >
                <Laptop className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              void handleLogout();
            }}
            className="group flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
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

              <nav className="relative mt-4 flex-1 space-y-2 px-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative flex items-center rounded-lg px-3 py-2.5 outline-none"
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-mobile"
                            className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/15"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div
                          className={`relative z-10 flex items-center space-x-3 ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </>
                    )}
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
                  onClick={() => {
                    void handleLogout();
                  }}
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
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 shadow-sm relative">
        {/* Topbar */}
        <header className="absolute top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 bg-card/40 backdrop-blur-md border-b border-border/30">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="-ml-2 mr-2 p-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden transition-colors"
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
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-sm border border-transparent hover:border-border/50 mr-4"
                title="Go Back"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden md:inline">Back</span>
              </button>
            )}

            <span className="ml-2 text-xl font-black md:hidden tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">SHIFTLY</span>
            {allowedPortals.length > 1 && (
              <div className="ml-4 hidden items-center border-l border-border/50 pl-6 md:flex h-8">
                <div className="relative group">
                  <select
                    className="cursor-pointer appearance-none bg-transparent py-1 pr-6 text-sm font-semibold capitalize text-muted-foreground transition-colors group-hover:text-foreground focus:outline-none"
                    value={activePortal}
                    onChange={(e) => {
                      const newPortal = e.target.value;
                      localStorage.setItem('activePortal', newPortal);
                      setActivePortal(newPortal);
                      void navigate(`/dashboard/${newPortal}`);
                    }}
                  >
                    {allowedPortals.map((portal) => (
                      <option key={portal} value={portal} className="bg-card text-foreground">
                        {portal.charAt(0).toUpperCase() + portal.slice(1)} Portal
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground pointer-events-none transition-colors" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-full p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary animate-pulse"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl py-2 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        2 New
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      <div className="cursor-pointer border-b border-border/30 px-5 py-4 transition-colors hover:bg-muted/50 group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          Your shift was approved
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Amazon Fulfillment • 2 hours ago
                        </p>
                      </div>
                      <div className="cursor-pointer border-b border-border/30 px-5 py-4 transition-colors hover:bg-muted/50 group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          New job match: Forklift Operator
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Home Depot • 5 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="p-3">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          void navigate('/notifications');
                        }}
                        className="w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-muted/50"
              >
                <div className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 transition-all shadow-sm">
                  <span className="text-sm font-bold uppercase text-primary">
                    {getInitials()}
                  </span>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500 shadow-sm"></div>
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-semibold text-foreground line-clamp-1 max-w-[120px] text-left">
                    {getFullName()}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {user?.role.toLowerCase() || 'Worker'}
                  </span>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block transition-transform" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl py-2 shadow-2xl"
                  >
                    <div className="mb-2 border-b border-border/50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-bold text-primary-foreground shadow-sm">
                          {getInitials()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{getFullName()}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          void navigate(
                            `/profile/${user?.role.toLowerCase() || 'worker'}/${user?.sub || 'mock-id'}`,
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <UserCircle className="h-4 w-4" />
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          void navigate('/settings');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="h-4 w-4" />
                        Account Settings
                      </button>
                    </div>

                    <div className="my-2 h-px bg-border/50"></div>

                    <div className="px-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          void handleLogout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden pt-24 px-4 pb-4 md:pt-28 md:px-8 md:pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
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
