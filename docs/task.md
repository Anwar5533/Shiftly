# SHIFTLY — Build Task Tracker

## Phase 0: Foundation

### Monorepo Scaffold

- [x] Root package.json (pnpm workspaces + Turborepo)
- [x] turbo.json task graph
- [x] .prettierrc, .editorconfig, .gitignore
- [x] pnpm-workspace.yaml
- [x] Shared packages: @shiftly/shared-types, @shiftly/shared-constants, @shiftly/shared-validation

### Backend (apps/api)

- [x] NestJS bootstrap with strict mode, helmet, compression, versioning
- [x] ConfigModule with Joi validation schema
- [x] PrismaService + PrismaModule
- [x] RedisService + RedisModule (global)
- [x] Global exception filter (envelope format, request ID)
- [x] Response transform interceptor
- [x] Logging interceptor
- [x] Health check module (/health/live + /health/ready)
- [x] Execute database migrations (`pnpm db:migrate`) using local Postgres.
- [x] Validate API health endpoints (`/health/live`, `/health/ready`).
- [x] Verify end-to-end auth flow locally.
- [x] Shared guards: JwtAuthGuard, RolesGuard, PermissionsGuard
- [x] Shared decorators: @CurrentUser, @Public, @Roles, @RequirePermissions
- [x] Auth module: OTP flow, email/password, JWT issuance, refresh rotation, logout
- [x] Passport JWT strategy
- [x] Auth DTOs (SendOtp, VerifyOtp, RegisterEmail, LoginEmail)
- [x] Domain event: UserRegisteredEvent

### Database

- [x] Prisma schema — 40+ models across 15 domain schemas
- [x] PostgreSQL init SQL (schema creation, pgvector, pg_trgm extensions)
- [ ] Initial migration (`pnpm db:migrate:dev`)
- [ ] Database seed script

### Frontend (apps/web)

- [x] Vite + React + TypeScript bootstrap
- [x] package.json with full production dependencies
- [x] vite.config.ts (aliases, proxy, build chunking, Vitest)
- [x] TailwindCSS v3 config + CSS variable design tokens (light/dark)
- [x] Global CSS (Google Fonts, custom scrollbar, animations, component utilities)
- [x] Redux Toolkit store (auth, ui, notifications slices)
- [x] TanStack Query client (error-aware retry policy)
- [x] React Router v6 data router (40+ routes, lazy, Suspense, ProtectedRoute)
- [x] Axios instance (in-memory tokens, refresh queue, idempotency keys)
- [x] Auth API functions
- [x] JWT decoder utility
- [x] ThemeProvider (light/dark/system with prefers-color-scheme listener)
- [x] ProtectedRoute (role-aware, auth check, location state preservation)
- [x] PageLoader (animated brand spinner)
- [x] ErrorBoundaryPage (dev details + reload button)
- [x] AuthLayout (split-screen branding + forms)
- [x] LoginPage (Phone OTP + Email/Password, animated toggle, full validation)
- [ ] OtpPage (6-digit code input + countdown + resend)
- [ ] RegisterPage (role-selective)
- [ ] OnboardingPage (multi-step profile setup)
- [ ] DashboardLayout (sidebar, topnav, mobile responsive)
- [ ] Worker/Employer/Recruiter/Admin dashboards

### Infrastructure

- [x] Docker Compose (PostgreSQL 16, Redis 7, Kafka, Zookeeper, OpenSearch, LocalStack)
- [x] LocalStack init script (S3 bucket + CORS, SNS topic, SES identity)
- [x] .env.example (all required variables documented)
- [ ] Dockerfile.api (multi-stage)
- [ ] Dockerfile.web (multi-stage + nginx)

### CI/CD

- [x] GitHub Actions: ci.yml (lint, type-check, unit tests, integration tests, security scan, Docker build)
- [ ] GitHub Actions: deploy.yml (staging auto-deploy on develop)
- [ ] GitHub Actions: dependency-review.yml

---

## Phase 1: Core Platform — Next

### Auth Completions

- [ ] OtpPage
- [ ] RegisterPage
- [ ] OnboardingPage (worker profile setup)

### Dashboard Layout

- [ ] DashboardLayout (sidebar nav, topbar, notification bell, theme toggle)
- [ ] WorkerDashboard
- [ ] EmployerDashboard
- [ ] RecruiterDashboard
- [ ] AdminDashboard

### Jobs Module (Backend)

- [ ] JobsModule: JobsController, JobsService, JobsRepository
- [ ] Create/Publish/Close job DTOs + validation
- [ ] Job search with filters (Prisma)
- [ ] AI job description optimisation endpoint (OpenAI)

### Jobs Module (Frontend)

- [ ] JobsListPage (filter sidebar, paginated cards)
- [ ] JobDetailPage (full spec, apply CTA)
- [ ] PostJobPage (multi-step form)

### Workers Module (Backend)

- [ ] WorkersController, WorkersService
- [ ] Profile CRUD, skill management
- [ ] AI resume parsing endpoint

### Payments Module (Backend)

- [ ] WalletService (balance, topup, withdrawal)
- [ ] EscrowService (lock, release, dispute)
- [ ] Razorpay/Stripe webhook handler

## Phase 2: AI, Realtime, Payments (Pending)

## Phase 3: Trust, Compliance & Admin (Pending)

## Phase 4: Scale, Harden & Launch (Pending)
