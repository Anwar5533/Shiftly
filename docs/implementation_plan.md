# Frontend Auth Completions & Dashboards Implementation

This plan outlines the frontend UI implementation for completing the authentication flows and establishing the core dashboard layouts for SHIFTLY.

## User Review Required
- **Design System Constraints**: We will be leveraging `shadcn/ui` style primitives and standard Tailwind utility classes.
- **Routing**: This plan focuses strictly on visual layout and mocked data fetching using the established Redux/Zustand and React Router data router patterns. Backend endpoints for role-specific dashboard metrics will be mocked until Phase 2.

## Proposed Changes

---

### Auth Completions
The authentication flow needs the remaining screens implemented to provide a complete user onboarding experience.

#### [NEW] [OtpPage.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/auth/pages/OtpPage.tsx)
- **Purpose**: A screen for entering the 6-digit verification code sent via Email/SMS.
- **Features**:
  - 6-digit split input field (using a custom OTP input or separate native inputs).
  - Countdown timer (e.g., 60 seconds) before the "Resend Code" button activates.
  - Automatic submission upon entering the 6th digit.

#### [NEW] [RegisterPage.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/auth/pages/RegisterPage.tsx)
- **Purpose**: Role selection and initial account creation.
- **Features**:
  - Visual cards for selecting account type (Worker, Employer, Recruiter).
  - Basic fields: First Name, Last Name, Email, Password.
  - Form validation via Zod + React Hook Form.

#### [NEW] [OnboardingPage.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/onboarding/pages/OnboardingPage.tsx)
- **Purpose**: A multi-step wizard for workers/employers to set up their profiles immediately after registration.
- **Features**:
  - Step indicator component.
  - Form sections for personal details, skills/industries, and location.

---

### Dashboard Infrastructure
A robust, responsive layout shell that adapts based on the user's role.

#### [NEW] [DashboardLayout.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/layouts/DashboardLayout.tsx)
- **Purpose**: The main application shell for authenticated users.
- **Features**:
  - **Sidebar Navigation**: Collapsible on desktop, drawer on mobile. Role-based links.
  - **Topbar**: Global search bar, Theme toggle (Light/Dark), Notification bell with dropdown, User Avatar menu.
  - **Content Area**: Flexible `<Outlet />` container for page content.

#### [NEW] [SidebarNav.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/layouts/components/SidebarNav.tsx)
- **Purpose**: The vertical navigation menu.
- **Features**: Active link highlighting, dynamic rendering based on user role (e.g., Workers see "Find Jobs", Employers see "Post Job").

#### [NEW] [Topbar.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/layouts/components/Topbar.tsx)
- **Purpose**: The horizontal navigation header.

---

### Role-Specific Dashboards
Landing pages for each role upon successful login.

#### [NEW] [WorkerDashboard.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/dashboard/pages/WorkerDashboard.tsx)
- **Features**: Stats cards (Earnings, Hours Worked), Upcoming Shifts list, Recommended Jobs carousel.

#### [NEW] [EmployerDashboard.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/dashboard/pages/EmployerDashboard.tsx)
- **Features**: Stats cards (Active Jobs, Total Spend), Recent Applications table, Quick "Post Job" CTA.

#### [NEW] [RecruiterDashboard.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/dashboard/pages/RecruiterDashboard.tsx)
- **Features**: Stats cards (Placements, Commissions), Candidate Pipeline funnel.

#### [NEW] [AdminDashboard.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/features/dashboard/pages/AdminDashboard.tsx)
- **Features**: Platform health metrics, KYC approval queue snippet, Recent system alerts.

---

### Routing Updates
Updates to the central router to integrate the new pages.

#### [MODIFY] [router.tsx](file:///Users/anwarkornipalli/Desktop/Shiftly/apps/web/src/app/router.tsx)
- Map `/register`, `/verify-otp`, and `/onboarding` to their respective components.
- Wrap the dashboard routes in `<DashboardLayout>` and assign role-specific components to `/dashboard/worker`, `/dashboard/employer`, etc.
- Configure role-based routing logic or redirects from the root `/dashboard` path.

## Verification Plan

### Automated Tests
- The React frontend builds successfully via `pnpm --filter @shiftly/web build`.
- Typescript compilation succeeds.

### Manual Verification
- We will start the Vite dev server.
- Verify that navigating to `/register` shows the role selection cards.
- Verify that navigating to `/dashboard/worker` displays the dashboard shell (sidebar + topbar) with worker-specific content.
- Verify dark/light mode toggle works in the topbar.
- Verify the sidebar collapses and expands smoothly, and transforms into a drawer on mobile viewport sizes.
