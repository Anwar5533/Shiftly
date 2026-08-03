-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "employers";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "jobs";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "knowledge_base";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "kyc";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "messaging";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notifications";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payments";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "recruiters";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "referrals";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reviews";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "subscriptions";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workers";

-- CreateEnum
CREATE TYPE "identity"."UserRole" AS ENUM ('WORKER', 'EMPLOYER', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "identity"."UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_KYC', 'PENDING_VERIFICATION', 'DELETED');

-- CreateEnum
CREATE TYPE "jobs"."JobType" AS ENUM ('SHIFT', 'PERMANENT', 'GIG');

-- CreateEnum
CREATE TYPE "jobs"."JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FILLED', 'CANCELLED', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "jobs"."ApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "jobs"."SalaryPeriod" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL', 'FIXED');

-- CreateEnum
CREATE TYPE "workers"."AvailabilityType" AS ENUM ('FULL_TIME', 'PART_TIME', 'WEEKENDS', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "employers"."EmployeeCountRange" AS ENUM ('RANGE_1_10', 'RANGE_11_50', 'RANGE_51_200', 'RANGE_201_500', 'RANGE_501_1000', 'RANGE_1000_PLUS');

-- CreateEnum
CREATE TYPE "payments"."TransactionType" AS ENUM ('TOPUP', 'WITHDRAWAL', 'ESCROW_LOCK', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'PLATFORM_FEE', 'REFERRAL_BONUS');

-- CreateEnum
CREATE TYPE "payments"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "payments"."EscrowStatus" AS ENUM ('LOCKED', 'RELEASED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "kyc"."KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "kyc"."DocumentType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT', 'PROOF_OF_ADDRESS', 'BUSINESS_REGISTRATION', 'RESUME');

-- CreateEnum
CREATE TYPE "kyc"."DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "notifications"."NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "notifications"."NotificationType" AS ENUM ('JOB_MATCH', 'APPLICATION_UPDATE', 'SHIFT_REMINDER', 'PAYMENT_RECEIVED', 'PAYMENT_SENT', 'KYC_UPDATE', 'CHAT_MESSAGE', 'REVIEW_RECEIVED', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "subscriptions"."SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "subscriptions"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "reviews"."ReviewTarget" AS ENUM ('WORKER', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "payments"."DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "jobs"."ShiftStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "audit"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'SUSPEND', 'RESTORE', 'PUBLISH', 'CANCEL');

-- CreateTable
CREATE TABLE "identity"."users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "identity"."UserRole" NOT NULL,
    "status" "identity"."UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "referredBy" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenJti" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."otp_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."push_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."worker_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "location" JSONB NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "availability" "workers"."AvailabilityType" NOT NULL DEFAULT 'FLEXIBLE',
    "hourlyRate" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalJobsDone" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "kyc"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."worker_skills" (
    "workerId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "yearsExp" INTEGER NOT NULL DEFAULT 0,
    "proficiency" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_skills_pkey" PRIMARY KEY ("workerId","skillId")
);

-- CreateTable
CREATE TABLE "workers"."worker_certifications" (
    "id" UUID NOT NULL,
    "workerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "worker_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers"."employer_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "location" JSONB NOT NULL,
    "employeeCount" "employers"."EmployeeCountRange" NOT NULL DEFAULT 'RANGE_1_10',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "kyc"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers"."departments" (
    "id" UUID NOT NULL,
    "employerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "headCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiters"."recruiter_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "agencyName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "specialisations" TEXT[],
    "placements" INTEGER NOT NULL DEFAULT 0,
    "successRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "kyc"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."jobs" (
    "id" UUID NOT NULL,
    "employerId" UUID NOT NULL,
    "recruiterId" UUID,
    "departmentId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "aiOptimisedDescription" TEXT,
    "jobType" "jobs"."JobType" NOT NULL,
    "status" "jobs"."JobStatus" NOT NULL DEFAULT 'DRAFT',
    "location" JSONB NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" DECIMAL(12,2) NOT NULL,
    "salaryMax" DECIMAL(12,2) NOT NULL,
    "salaryCurrency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "salaryPeriod" "jobs"."SalaryPeriod" NOT NULL DEFAULT 'HOURLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "shiftDurationHours" DECIMAL(4,2),
    "positionsTotal" INTEGER NOT NULL DEFAULT 1,
    "positionsFilled" INTEGER NOT NULL DEFAULT 0,
    "applicationDeadline" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."job_skills" (
    "jobId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "jobs"."job_applications" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "workerId" UUID NOT NULL,
    "status" "jobs"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "aiScore" DECIMAL(5,2),
    "aiBreakdown" JSONB,
    "employerNote" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs"."shifts" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "workerId" UUID NOT NULL,
    "status" "jobs"."ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "clockInLocation" JSONB,
    "clockOutLocation" JSONB,
    "hoursWorked" DECIMAL(6,2),
    "overtimeHours" DECIMAL(6,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."wallets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "escrowBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."transactions" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "type" "payments"."TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "payments"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "referenceId" TEXT,
    "externalTxnId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."escrow_locks" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "payments"."EscrowStatus" NOT NULL DEFAULT 'LOCKED',
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "escrow_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."escrow_disputes" (
    "id" UUID NOT NULL,
    "escrowId" UUID NOT NULL,
    "raisedById" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT,
    "status" "payments"."DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "escrow_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaging"."conversations" (
    "id" UUID NOT NULL,
    "jobId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaging"."conversation_participants" (
    "conversationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "messaging"."messages" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaging"."message_attachments" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications"."notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "notifications"."NotificationType" NOT NULL,
    "channel" "notifications"."NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews"."reviews" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "revieweeId" UUID NOT NULL,
    "targetType" "reviews"."ReviewTarget" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc"."kyc_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "kyc"."KycStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" UUID,
    "rejectionReason" TEXT,
    "notes" TEXT,

    CONSTRAINT "kyc_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc"."kyc_documents" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "kyc"."DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "kyc"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals"."referral_codes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals"."referral_events" (
    "id" UUID NOT NULL,
    "referralCodeId" UUID NOT NULL,
    "referredUserId" UUID NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions"."subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "plan" "subscriptions"."SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "subscriptions"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "externalSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."audit_logs" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" "audit"."AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base"."kb_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kb_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base"."kb_articles" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "tags" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kb_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "identity"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "identity"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshTokenJti_key" ON "identity"."sessions"("refreshTokenJti");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "identity"."sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_refreshTokenJti_idx" ON "identity"."sessions"("refreshTokenJti");

-- CreateIndex
CREATE INDEX "otp_tokens_phone_idx" ON "identity"."otp_tokens"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "identity"."push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "identity"."push_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_userId_key" ON "workers"."worker_profiles"("userId");

-- CreateIndex
CREATE INDEX "worker_profiles_userId_idx" ON "workers"."worker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "workers"."skills"("name");

-- CreateIndex
CREATE INDEX "worker_certifications_workerId_idx" ON "workers"."worker_certifications"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "employer_profiles_userId_key" ON "employers"."employer_profiles"("userId");

-- CreateIndex
CREATE INDEX "employer_profiles_userId_idx" ON "employers"."employer_profiles"("userId");

-- CreateIndex
CREATE INDEX "departments_employerId_idx" ON "employers"."departments"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_profiles_userId_key" ON "recruiters"."recruiter_profiles"("userId");

-- CreateIndex
CREATE INDEX "recruiter_profiles_userId_idx" ON "recruiters"."recruiter_profiles"("userId");

-- CreateIndex
CREATE INDEX "jobs_employerId_idx" ON "jobs"."jobs"("employerId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"."jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_jobType_idx" ON "jobs"."jobs"("jobType");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"."jobs"("createdAt");

-- CreateIndex
CREATE INDEX "job_applications_jobId_idx" ON "jobs"."job_applications"("jobId");

-- CreateIndex
CREATE INDEX "job_applications_workerId_idx" ON "jobs"."job_applications"("workerId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "jobs"."job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_workerId_key" ON "jobs"."job_applications"("jobId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_applicationId_key" ON "jobs"."shifts"("applicationId");

-- CreateIndex
CREATE INDEX "shifts_jobId_idx" ON "jobs"."shifts"("jobId");

-- CreateIndex
CREATE INDEX "shifts_workerId_idx" ON "jobs"."shifts"("workerId");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "jobs"."shifts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "payments"."wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON "payments"."transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "transactions_walletId_idx" ON "payments"."transactions"("walletId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "payments"."transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "payments"."transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_locks_applicationId_key" ON "payments"."escrow_locks"("applicationId");

-- CreateIndex
CREATE INDEX "escrow_locks_walletId_idx" ON "payments"."escrow_locks"("walletId");

-- CreateIndex
CREATE INDEX "escrow_locks_status_idx" ON "payments"."escrow_locks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_disputes_escrowId_key" ON "payments"."escrow_disputes"("escrowId");

-- CreateIndex
CREATE INDEX "conversations_updatedAt_idx" ON "messaging"."conversations"("updatedAt");

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "messaging"."conversation_participants"("userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messaging"."messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messaging"."messages"("senderId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_revieweeId_idx" ON "reviews"."reviews"("revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_jobId_reviewerId_revieweeId_key" ON "reviews"."reviews"("jobId", "reviewerId", "revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_requests_userId_key" ON "kyc"."kyc_requests"("userId");

-- CreateIndex
CREATE INDEX "kyc_requests_status_idx" ON "kyc"."kyc_requests"("status");

-- CreateIndex
CREATE INDEX "kyc_documents_userId_idx" ON "kyc"."kyc_documents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_userId_key" ON "referrals"."referral_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referrals"."referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_events_referralCodeId_idx" ON "referrals"."referral_events"("referralCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"."subscriptions"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit"."audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit"."audit_logs"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit"."audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "kb_categories_name_key" ON "knowledge_base"."kb_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kb_categories_slug_key" ON "knowledge_base"."kb_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kb_articles_slug_key" ON "knowledge_base"."kb_articles"("slug");

-- CreateIndex
CREATE INDEX "kb_articles_slug_idx" ON "knowledge_base"."kb_articles"("slug");

-- CreateIndex
CREATE INDEX "kb_articles_isPublished_idx" ON "knowledge_base"."kb_articles"("isPublished");

-- AddForeignKey
ALTER TABLE "identity"."users" ADD CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."otp_tokens" ADD CONSTRAINT "otp_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers"."worker_profiles" ADD CONSTRAINT "worker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers"."worker_skills" ADD CONSTRAINT "worker_skills_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"."worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers"."worker_skills" ADD CONSTRAINT "worker_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "workers"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers"."worker_certifications" ADD CONSTRAINT "worker_certifications_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"."worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers"."employer_profiles" ADD CONSTRAINT "employer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers"."departments" ADD CONSTRAINT "departments_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employers"."employer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters"."recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."jobs" ADD CONSTRAINT "jobs_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employers"."employer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."jobs" ADD CONSTRAINT "jobs_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "recruiters"."recruiter_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."jobs" ADD CONSTRAINT "jobs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "employers"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."job_skills" ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."job_skills" ADD CONSTRAINT "job_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "workers"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."job_applications" ADD CONSTRAINT "job_applications_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"."worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."shifts" ADD CONSTRAINT "shifts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."shifts" ADD CONSTRAINT "shifts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "jobs"."job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs"."shifts" ADD CONSTRAINT "shifts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"."worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "payments"."wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."escrow_locks" ADD CONSTRAINT "escrow_locks_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "payments"."wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."escrow_locks" ADD CONSTRAINT "escrow_locks_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."escrow_locks" ADD CONSTRAINT "escrow_locks_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "jobs"."job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."escrow_disputes" ADD CONSTRAINT "escrow_disputes_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "payments"."escrow_locks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."conversations" ADD CONSTRAINT "conversations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "messaging"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "messaging"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging"."message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messaging"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews"."reviews" ADD CONSTRAINT "reviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"."jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews"."reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews"."reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc"."kyc_requests" ADD CONSTRAINT "kyc_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc"."kyc_documents" ADD CONSTRAINT "kyc_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals"."referral_codes" ADD CONSTRAINT "referral_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals"."referral_events" ADD CONSTRAINT "referral_events_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "referrals"."referral_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base"."kb_articles" ADD CONSTRAINT "kb_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "knowledge_base"."kb_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
