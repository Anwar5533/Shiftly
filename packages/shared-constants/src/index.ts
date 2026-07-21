// ─── User & Role Constants ────────────────────────────────────────────────────

export const USER_ROLES = {
  WORKER: 'WORKER',
  EMPLOYER: 'EMPLOYER',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_KYC: 'PENDING_KYC',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  DELETED: 'DELETED',
} as const;

// ─── Job Constants ────────────────────────────────────────────────────────────

export const JOB_TYPES = {
  SHIFT: 'SHIFT',
  PERMANENT: 'PERMANENT',
  GIG: 'GIG',
} as const;

export const JOB_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  ARCHIVED: 'ARCHIVED',
  EXPIRED: 'EXPIRED',
} as const;

export const APPLICATION_STATUSES = {
  PENDING: 'PENDING',
  SHORTLISTED: 'SHORTLISTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  COMPLETED: 'COMPLETED',
} as const;

// ─── Payment Constants ────────────────────────────────────────────────────────

export const TRANSACTION_TYPES = {
  TOPUP: 'TOPUP',
  WITHDRAWAL: 'WITHDRAWAL',
  ESCROW_LOCK: 'ESCROW_LOCK',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  ESCROW_REFUND: 'ESCROW_REFUND',
  PLATFORM_FEE: 'PLATFORM_FEE',
  REFERRAL_BONUS: 'REFERRAL_BONUS',
} as const;

export const ESCROW_STATUSES = {
  LOCKED: 'LOCKED',
  RELEASED: 'RELEASED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
} as const;

// ─── KYC Constants ────────────────────────────────────────────────────────────

export const KYC_STATUSES = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export const DOCUMENT_TYPES = {
  PASSPORT: 'PASSPORT',
  NATIONAL_ID: 'NATIONAL_ID',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  RESIDENCE_PERMIT: 'RESIDENCE_PERMIT',
  PROOF_OF_ADDRESS: 'PROOF_OF_ADDRESS',
  BUSINESS_REGISTRATION: 'BUSINESS_REGISTRATION',
  RESUME: 'RESUME',
} as const;

// ─── Subscription Constants ───────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ['5 job postings/month', 'Basic search', 'Standard support'],
  BASIC: ['25 job postings/month', 'AI matching', 'Priority support', 'Analytics'],
  PRO: [
    'Unlimited job postings',
    'AI matching + JD optimiser',
    'Resume parsing',
    'Advanced analytics',
    'Dedicated support',
    'API access',
  ],
  ENTERPRISE: [
    'Everything in Pro',
    'Custom integrations',
    'SLA guarantee',
    'Dedicated account manager',
    'White-label option',
    'SSO',
  ],
};

export const PLAN_LIMITS: Record<string, { jobPostings: number; aiRequests: number }> = {
  FREE: { jobPostings: 5, aiRequests: 0 },
  BASIC: { jobPostings: 25, aiRequests: 50 },
  PRO: { jobPostings: -1, aiRequests: 500 },
  ENTERPRISE: { jobPostings: -1, aiRequests: -1 },
};

// ─── Error Codes ──────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_TOO_MANY_ATTEMPTS: 'OTP_TOO_MANY_ATTEMPTS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_PENDING_KYC: 'USER_PENDING_KYC',

  // Job
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  JOB_NOT_PUBLISHED: 'JOB_NOT_PUBLISHED',
  JOB_FILLED: 'JOB_FILLED',
  JOB_ALREADY_APPLIED: 'JOB_ALREADY_APPLIED',
  JOB_OWN_APPLICATION: 'JOB_OWN_APPLICATION',
  JOB_LIMIT_REACHED: 'JOB_LIMIT_REACHED',

  // Payment
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  WALLET_FROZEN: 'WALLET_FROZEN',
  ESCROW_NOT_FOUND: 'ESCROW_NOT_FOUND',
  ESCROW_ALREADY_RELEASED: 'ESCROW_ALREADY_RELEASED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // KYC
  KYC_NOT_FOUND: 'KYC_NOT_FOUND',
  KYC_ALREADY_APPROVED: 'KYC_ALREADY_APPROVED',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
  DOCUMENT_INVALID_TYPE: 'DOCUMENT_INVALID_TYPE',

  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ─── Permissions ──────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Job permissions
  JOB_READ: 'job:read',
  JOB_CREATE: 'job:create',
  JOB_UPDATE_OWN: 'job:update:own',
  JOB_UPDATE_ANY: 'job:update:any',
  JOB_DELETE_OWN: 'job:delete:own',
  JOB_DELETE_ANY: 'job:delete:any',
  JOB_PUBLISH: 'job:publish',

  // Application permissions
  APPLICATION_CREATE: 'application:create',
  APPLICATION_READ_OWN: 'application:read:own',
  APPLICATION_READ_ANY: 'application:read:any',
  APPLICATION_UPDATE_OWN: 'application:update:own',
  APPLICATION_UPDATE_ANY: 'application:update:any',

  // Worker permissions
  WORKER_PROFILE_READ: 'worker:profile:read',
  WORKER_PROFILE_UPDATE_OWN: 'worker:profile:update:own',

  // Employer permissions
  EMPLOYER_PROFILE_READ: 'employer:profile:read',
  EMPLOYER_PROFILE_UPDATE_OWN: 'employer:profile:update:own',

  // Payment permissions
  WALLET_VIEW: 'wallet:view',
  WALLET_TOPUP: 'wallet:topup',
  WALLET_WITHDRAW: 'wallet:withdraw',
  ESCROW_CREATE: 'escrow:create',
  ESCROW_RELEASE: 'escrow:release',
  ESCROW_DISPUTE: 'escrow:dispute',

  // KYC permissions
  KYC_SUBMIT: 'kyc:submit',
  KYC_REVIEW: 'kyc:review',
  KYC_APPROVE: 'kyc:approve',

  // Admin permissions
  USER_MANAGE: 'user:manage',
  PLATFORM_SETTINGS: 'platform:settings',
  AUDIT_VIEW: 'audit:view',
  ANALYTICS_VIEW: 'analytics:view',
  SUBSCRIPTION_MANAGE: 'subscription:manage',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  WORKER: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.APPLICATION_CREATE,
    PERMISSIONS.APPLICATION_READ_OWN,
    PERMISSIONS.APPLICATION_UPDATE_OWN,
    PERMISSIONS.WORKER_PROFILE_READ,
    PERMISSIONS.WORKER_PROFILE_UPDATE_OWN,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.WALLET_WITHDRAW,
    PERMISSIONS.KYC_SUBMIT,
  ],
  EMPLOYER: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE_OWN,
    PERMISSIONS.JOB_DELETE_OWN,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.APPLICATION_READ_ANY,
    PERMISSIONS.APPLICATION_UPDATE_ANY,
    PERMISSIONS.WORKER_PROFILE_READ,
    PERMISSIONS.EMPLOYER_PROFILE_READ,
    PERMISSIONS.EMPLOYER_PROFILE_UPDATE_OWN,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.WALLET_TOPUP,
    PERMISSIONS.ESCROW_CREATE,
    PERMISSIONS.ESCROW_RELEASE,
    PERMISSIONS.ESCROW_DISPUTE,
    PERMISSIONS.KYC_SUBMIT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  RECRUITER: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE_OWN,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.APPLICATION_READ_ANY,
    PERMISSIONS.APPLICATION_UPDATE_ANY,
    PERMISSIONS.WORKER_PROFILE_READ,
    PERMISSIONS.EMPLOYER_PROFILE_READ,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.WALLET_TOPUP,
    PERMISSIONS.WALLET_WITHDRAW,
    PERMISSIONS.KYC_SUBMIT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  ADMIN: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_UPDATE_ANY,
    PERMISSIONS.JOB_DELETE_ANY,
    PERMISSIONS.APPLICATION_READ_ANY,
    PERMISSIONS.APPLICATION_UPDATE_ANY,
    PERMISSIONS.WORKER_PROFILE_READ,
    PERMISSIONS.EMPLOYER_PROFILE_READ,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.KYC_REVIEW,
    PERMISSIONS.KYC_APPROVE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
  ],
  SUPER_ADMIN: Object.values(PERMISSIONS),
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── File Upload ──────────────────────────────────────────────────────────────

export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'] as const,
  ALLOWED_RESUME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  OTP_SEND: { ttl: 60, limit: 3 },
  OTP_VERIFY: { ttl: 300, limit: 5 },
  LOGIN: { ttl: 900, limit: 10 },
  API_DEFAULT: { ttl: 60, limit: 100 },
  API_AUTHENTICATED: { ttl: 60, limit: 300 },
  AI_REQUESTS: { ttl: 60, limit: 10 },
} as const;

// ─── Kafka Topics ─────────────────────────────────────────────────────────────

export const KAFKA_TOPICS = {
  USER_REGISTERED: 'shiftly.auth.user-registered.v1',
  USER_VERIFIED: 'shiftly.auth.user-verified.v1',
  JOB_PUBLISHED: 'shiftly.jobs.job-published.v1',
  JOB_FILLED: 'shiftly.jobs.job-filled.v1',
  JOB_CANCELLED: 'shiftly.jobs.job-cancelled.v1',
  APPLICATION_SUBMITTED: 'shiftly.jobs.application-submitted.v1',
  APPLICATION_ACCEPTED: 'shiftly.jobs.application-accepted.v1',
  APPLICATION_REJECTED: 'shiftly.jobs.application-rejected.v1',
  SHIFT_STARTED: 'shiftly.shifts.shift-started.v1',
  SHIFT_COMPLETED: 'shiftly.shifts.shift-completed.v1',
  SHIFT_CLOCK_IN: 'shiftly.shifts.shift-clock-in.v1',
  SHIFT_CLOCK_OUT: 'shiftly.shifts.shift-clock-out.v1',
  ESCROW_LOCKED: 'shiftly.payments.escrow-locked.v1',
  ESCROW_RELEASED: 'shiftly.payments.escrow-released.v1',
  ESCROW_DISPUTED: 'shiftly.payments.escrow-disputed.v1',
  PAYMENT_PROCESSED: 'shiftly.payments.payment-processed.v1',
  WITHDRAWAL_REQUESTED: 'shiftly.payments.withdrawal-requested.v1',
  DOCUMENT_UPLOADED: 'shiftly.kyc.document-uploaded.v1',
  KYC_APPROVED: 'shiftly.kyc.kyc-approved.v1',
  KYC_REJECTED: 'shiftly.kyc.kyc-rejected.v1',
  SEND_EMAIL: 'shiftly.notifications.send-email.v1',
  SEND_SMS: 'shiftly.notifications.send-sms.v1',
  SEND_PUSH: 'shiftly.notifications.send-push.v1',
  INDEX_JOB: 'shiftly.search.index-job.v1',
  INDEX_WORKER: 'shiftly.search.index-worker.v1',
  REMOVE_DOCUMENT: 'shiftly.search.remove-document.v1',
  AUDIT_EVENT_LOGGED: 'shiftly.audit.event-logged.v1',
  PARSE_RESUME: 'shiftly.ai.parse-resume.v1',
  MATCH_COMPLETED: 'shiftly.ai.match-completed.v1',
} as const;
