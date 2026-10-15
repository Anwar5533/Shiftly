/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { PageLoader } from '@/shared/components/PageLoader';
import { ErrorBoundaryPage } from '@/shared/components/ErrorBoundaryPage';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const OtpPage = lazy(() => import('@/features/auth/pages/OtpPage'));
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'));

const WorkerDashboard = lazy(() => import('@/features/dashboard/pages/WorkerDashboard'));
const EmployerDashboard = lazy(() => import('@/features/dashboard/pages/EmployerDashboard'));
const RecruiterDashboard = lazy(() => import('@/features/dashboard/pages/RecruiterDashboard'));
const AdminDashboard = lazy(() => import('@/features/dashboard/pages/AdminDashboard'));

const JobsListPage = lazy(() => import('@/features/jobs/pages/JobsListPage'));
const JobDetailPage = lazy(() => import('@/features/jobs/pages/JobDetailPage'));
const PostJobPage = lazy(() => import('@/features/jobs/pages/PostJobPage'));
const ActiveShiftPage = lazy(() => import('@/features/jobs/pages/ActiveShiftPage'));
const JobApplicationsPage = lazy(() => import('@/features/applications/pages/JobApplicationsPage'));

const MessagesPage = lazy(() => import('@/features/messaging/pages/MessagesPage'));
const MessagingPage = lazy(() =>
  import('@/features/messaging/pages/MessagingPage').then((module) => ({
    default: module.MessagingPage,
  })),
);

const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const VerificationPage = lazy(() => import('@/features/kyc/pages/VerificationPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));

const ManageJobsPage = lazy(() => import('@/features/jobs/pages/ManageJobsPage'));
const RequisitionsPage = lazy(() => import('@/features/jobs/pages/RequisitionsPage'));
const MyApplicationsPage = lazy(() => import('@/features/applications/pages/MyApplicationsPage'));
const ApplicantsPage = lazy(() => import('@/features/applications/pages/ApplicantsPage'));
const CandidatesPage = lazy(() => import('@/features/candidates/pages/CandidatesPage'));
const InterviewsPage = lazy(() => import('@/features/interviews/pages/InterviewsPage'));
const TimesheetsPage = lazy(() => import('@/features/timesheets/pages/TimesheetsPage'));
const TimesheetApprovalPage = lazy(() =>
  import('@/features/timesheets/pages/TimesheetApprovalPage').then((module) => ({
    default: module.TimesheetApprovalPage,
  })),
);
const BillingPage = lazy(() => import('@/features/billing/pages/BillingPage'));
const UsersManagementPage = lazy(() => import('@/features/admin/pages/UsersManagementPage'));
const PlatformAnalyticsPage = lazy(() => import('@/features/admin/pages/PlatformAnalyticsPage'));
const SystemLogsPage = lazy(() => import('@/features/admin/pages/SystemLogsPage'));
const FinancialsPage = lazy(() => import('@/features/admin/pages/FinancialsPage'));
const HelpCenterPage = lazy(() => import('@/features/help/pages/HelpCenterPage'));

import { useAppSelector } from '@/app/store';
import type { UserRole } from '@shiftly/shared-types';

function DashboardRedirect(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const portal = user?.role ? user.role.toLowerCase() : 'worker';
  return <Navigate to={`/dashboard/${portal}`} replace />;
}

const wrap = (Component: any, roles?: UserRole[]) => (
  <Suspense fallback={<PageLoader fullScreen={false} />}>
    {roles ? (
      <ProtectedRoute roles={roles}>
        <Component />
      </ProtectedRoute>
    ) : (
      <Component />
    )}
  </Suspense>
);

export const router = createBrowserRouter([
  // ─── Auth routes (public) ──────────────────────────────────────────────
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { path: '/login', element: wrap(LoginPage) },
      { path: '/register', element: wrap(RegisterPage) },
      { path: '/verify-otp', element: wrap(OtpPage) },
    ],
  },

  // ─── Onboarding (authenticated, no shell) ─────────────────────────────
  {
    path: '/onboarding',
    element: <ProtectedRoute>{wrap(OnboardingPage)}</ProtectedRoute>,
  },

  // ─── Main application shell ────────────────────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryPage />,
    children: [
      { path: '/', element: <DashboardRedirect /> },
      { path: '/dashboard', element: <DashboardRedirect /> },
      { path: '/dashboard/worker', element: wrap(WorkerDashboard, ['WORKER', 'SUPER_ADMIN']) },
      {
        path: '/dashboard/employer',
        element: wrap(EmployerDashboard, ['EMPLOYER', 'SUPER_ADMIN']),
      },
      {
        path: '/dashboard/recruiter',
        element: wrap(RecruiterDashboard, ['RECRUITER', 'SUPER_ADMIN']),
      },
      { path: '/dashboard/admin', element: wrap(AdminDashboard, ['ADMIN', 'SUPER_ADMIN']) },
      { path: '/jobs', element: wrap(JobsListPage) },
      { path: '/jobs/:id', element: wrap(JobDetailPage) },
      { path: '/shifts/:id', element: wrap(ActiveShiftPage, ['WORKER', 'SUPER_ADMIN']) },
      {
        path: '/jobs/:id/applications',
        element: wrap(JobApplicationsPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      { path: '/jobs/post', element: wrap(PostJobPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']) },
      {
        path: '/jobs/manage',
        element: wrap(ManageJobsPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      {
        path: '/jobs/requisitions',
        element: wrap(RequisitionsPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      { path: '/applications/my', element: wrap(MyApplicationsPage, ['WORKER', 'SUPER_ADMIN']) },
      {
        path: '/applicants',
        element: wrap(ApplicantsPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      {
        path: '/candidates',
        element: wrap(CandidatesPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      { path: '/interviews', element: wrap(InterviewsPage) },
      { path: '/timesheets', element: wrap(TimesheetsPage, ['WORKER', 'SUPER_ADMIN']) },
      { path: '/billing', element: wrap(BillingPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']) },
      { path: '/admin/users', element: wrap(UsersManagementPage, ['ADMIN', 'SUPER_ADMIN']) },
      {
        path: '/admin/analytics',
        element: wrap(PlatformAnalyticsPage, ['ADMIN', 'SUPER_ADMIN']),
      },
      { path: '/admin/logs', element: wrap(SystemLogsPage, ['ADMIN', 'SUPER_ADMIN']) },
      { path: '/admin/financials', element: wrap(FinancialsPage, ['ADMIN', 'SUPER_ADMIN']) },
      { path: '/messages', element: wrap(MessagesPage) },
      { path: '/chat', element: wrap(MessagingPage) },
      {
        path: '/timesheet-approvals',
        element: wrap(TimesheetApprovalPage, ['EMPLOYER', 'RECRUITER', 'SUPER_ADMIN']),
      },
      { path: '/profile/:role/:id', element: wrap(ProfilePage) },
      { path: '/wallet', element: wrap(WalletPage) },
      { path: '/verification', element: wrap(VerificationPage) },
      { path: '/settings', element: wrap(SettingsPage) },
      { path: '/notifications', element: wrap(NotificationsPage) },
      { path: '/help', element: wrap(HelpCenterPage) },
      { path: '*', element: <DashboardRedirect /> },
    ],
  },
]);
