import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { clearUser } from '@/features/auth/store/authSlice';
import { authApi } from '@/features/auth/api/auth.api';
import { clearAccessToken } from '@/shared/lib/api';
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
  Video,
  BarChart,
  Activity,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { profileApi } from '@/features/profile/api/profile.api';
import type { WorkerProfile } from '@shiftly/shared-types';
import { setTheme } from '@/shared/store/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';

export function DashboardLayout(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<WorkerProfile | null>(null);

  React.useEffect(() => {
    if (location.pathname.startsWith('/dashboard/')) {
      const portal = location.pathname.split('/')[2];
      if (portal) {
        localStorage.setItem('activePortal', portal);
      }
    }
  }, [location.pathname]);

  React.useEffect(() => {
    // Fetch profile to get real firstName for the avatar initial
    const fetchProfile = async () => {
      if (user?.role === 'WORKER') {
        try {
          const data = await profileApi.getProfile();
          setUserProfile(data);
        } catch (err) {
          // Ignore
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore API error on logout
    } finally {
      clearAccessToken();
      dispatch(clearUser());
      navigate('/login', { replace: true });
    }
  };

  const activePortal = localStorage.getItem('activePortal') || user?.role.toLowerCase() || 'worker';
  
  const baseItems = [
    { label: 'Messages', path: '/messages', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', path: `/profile/${user?.role.toLowerCase()}/${user?.sub}`, icon: <UserCircle className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  let navItems = [];
  switch (activePortal) {
    case 'employer':
      navItems = [
        { label: 'Dashboard', path: '/dashboard/employer', icon: <Briefcase className="w-5 h-5" /> },
        { label: 'Post a Job', path: '/jobs/post', icon: <PlusCircle className="w-5 h-5" /> },
        { label: 'Manage Jobs', path: '/jobs/manage', icon: <FileText className="w-5 h-5" /> },
        { label: 'Applicants', path: '/applicants', icon: <Users className="w-5 h-5" /> },
        { label: 'Billing', path: '/billing', icon: <CreditCard className="w-5 h-5" /> },
        ...baseItems
      ];
      break;
    case 'recruiter':
      navItems = [
        { label: 'Dashboard', path: '/dashboard/recruiter', icon: <Briefcase className="w-5 h-5" /> },
        { label: 'Find Candidates', path: '/candidates', icon: <Search className="w-5 h-5" /> },
        { label: 'Open Reqs', path: '/jobs/requisitions', icon: <FileText className="w-5 h-5" /> },
        { label: 'Interviews', path: '/interviews', icon: <Video className="w-5 h-5" /> },
        { label: 'Earnings', path: '/wallet', icon: <Wallet className="w-5 h-5" /> },
        ...baseItems
      ];
      break;
    case 'admin':
      navItems = [
        { label: 'Dashboard', path: '/dashboard/admin', icon: <Briefcase className="w-5 h-5" /> },
        { label: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart className="w-5 h-5" /> },
        { label: 'System Logs', path: '/admin/logs', icon: <Activity className="w-5 h-5" /> },
        { label: 'Financials', path: '/admin/financials', icon: <DollarSign className="w-5 h-5" /> },
        ...baseItems
      ];
      break;
    default:
      navItems = [
        { label: 'Dashboard', path: '/dashboard/worker', icon: <Briefcase className="w-5 h-5" /> },
        { label: 'Find Jobs', path: '/jobs', icon: <Search className="w-5 h-5" /> },
        { label: 'My Applications', path: '/applications/my', icon: <FileText className="w-5 h-5" /> },
        { label: 'Timesheets', path: '/timesheets', icon: <Clock className="w-5 h-5" /> },
        { label: 'Wallet', path: '/wallet', icon: <Wallet className="w-5 h-5" /> },
        ...baseItems
      ];
      break;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-brand">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">SHIFTLY</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-4">
            <div className="flex space-x-2">
              <button onClick={() => dispatch(setTheme('light'))} className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Sun className="w-4 h-4" />
              </button>
              <button onClick={() => dispatch(setTheme('dark'))} className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Moon className="w-4 h-4" />
              </button>
              <button onClick={() => dispatch(setTheme('system'))} className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Laptop className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-brand">
                    <span className="text-primary-foreground font-bold text-lg">S</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">SHIFTLY</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1 mt-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 mt-auto">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-4">
                  <div className="flex space-x-2">
                    <button onClick={() => dispatch(setTheme('light'))} className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Sun className="w-4 h-4" />
                    </button>
                    <button onClick={() => dispatch(setTheme('dark'))} className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Moon className="w-4 h-4" />
                    </button>
                    <button onClick={() => dispatch(setTheme('system'))} className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Laptop className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
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
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline font-medium text-sm">Back</span>
              </button>
            )}

            <span className="ml-4 text-lg font-bold md:hidden">SHIFTLY</span>
            <div className="hidden md:flex items-center border-l border-border pl-4 ml-4">
              <select 
                className="bg-transparent text-sm text-muted-foreground capitalize font-medium focus:outline-none cursor-pointer hover:text-foreground transition-colors"
                value={localStorage.getItem('activePortal') || user?.role.toLowerCase() || 'worker'}
                onChange={(e) => {
                  localStorage.setItem('activePortal', e.target.value);
                  navigate(`/dashboard/${e.target.value}`);
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
                className="p-2 text-muted-foreground hover:text-foreground relative focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-lg py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">2 New</span>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 cursor-pointer">
                        <p className="text-sm font-medium text-foreground">Your shift was approved</p>
                        <p className="text-xs text-muted-foreground mt-1">Amazon Fulfillment • 2 hours ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 cursor-pointer">
                        <p className="text-sm font-medium text-foreground">New job match: Forklift Operator</p>
                        <p className="text-xs text-muted-foreground mt-1">Home Depot • 5 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate('/notifications');
                        }}
                        className="w-full text-center px-4 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-md transition-colors"
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
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer relative">
                  <span className="text-sm font-semibold text-primary uppercase">
                    {userProfile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.email || 'User')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate(`/profile/${user?.role.toLowerCase() || 'worker'}/${user?.sub || 'mock-id'}`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <UserCircle className="w-4 h-4 text-muted-foreground" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                    </button>

                    <div className="h-px bg-border my-2"></div>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

