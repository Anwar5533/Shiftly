import { z } from 'zod';

// ─── Common Schemas ───────────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +919876543210)');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const registerEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z.enum(['EMPLOYER', 'RECRUITER']),
});

export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type RegisterEmailDto = z.infer<typeof registerEmailSchema>;
export type LoginEmailDto = z.infer<typeof loginEmailSchema>;

// ─── Job Schemas ──────────────────────────────────────────────────────────────

export const jobLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().length(2, 'Country must be ISO 3166-1 alpha-2 (e.g. IN, US)'),
  postalCode: z.string().min(3).max(20),
  isRemote: z.boolean().default(false),
});

const baseJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
  jobType: z.enum(['SHIFT', 'PERMANENT', 'GIG']),
  location: jobLocationSchema,
  salaryMin: z.number().positive('Salary must be positive'),
  salaryMax: z.number().positive('Salary must be positive'),
  salaryCurrency: z.string().length(3, 'Currency must be ISO 4217 (e.g. INR, USD)'),
  salaryPeriod: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL', 'FIXED']),
  skillsRequired: z.array(z.string().uuid()).min(1).max(20),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime().optional().nullable(),
  shiftDurationHours: z.number().min(1).max(24).optional().nullable(),
  positionsTotal: z.number().int().min(1).max(1000).default(1),
});

export const createJobSchema = baseJobSchema
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  })
  .refine(
    (data) => {
      if (data.jobType === 'SHIFT' && !data.shiftDurationHours) {
        return false;
      }
      return true;
    },
    {
      message: 'Shift duration is required for SHIFT type jobs',
      path: ['shiftDurationHours'],
    },
  );

export const updateJobSchema = baseJobSchema.partial();

export const filterJobsSchema = z.object({
  q: z.string().optional(),
  jobType: z.enum(['SHIFT', 'PERMANENT', 'GIG']).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  skills: z.array(z.string().uuid()).optional(),
  isRemote: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
export type UpdateJobDto = z.infer<typeof updateJobSchema>;
export type FilterJobsDto = z.infer<typeof filterJobsSchema>;

// ─── Application Schemas ──────────────────────────────────────────────────────

export const createApplicationSchema = z.object({
  coverLetter: z.string().max(2000).optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['SHORTLISTED', 'ACCEPTED', 'REJECTED']),
  feedback: z.string().max(500).optional().nullable(),
});

export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusDto = z.infer<typeof updateApplicationStatusSchema>;

// ─── Worker Profile Schemas ───────────────────────────────────────────────────

export const updateWorkerProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  bio: z.string().max(1000).optional().nullable(),
  location: jobLocationSchema.partial().optional(),
  skills: z.array(z.string().uuid()).max(50).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  availability: z.enum(['FULL_TIME', 'PART_TIME', 'WEEKENDS', 'FLEXIBLE']).optional(),
  hourlyRate: z.number().positive().optional().nullable(),
  currency: z.string().length(3).optional(),
});

export type UpdateWorkerProfileDto = z.infer<typeof updateWorkerProfileSchema>;

// ─── Employer Profile Schemas ─────────────────────────────────────────────────

export const updateEmployerProfileSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  industry: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  location: jobLocationSchema.partial().optional(),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
});

export type UpdateEmployerProfileDto = z.infer<typeof updateEmployerProfileSchema>;

// ─── Payment Schemas ──────────────────────────────────────────────────────────

export const walletTopupSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  currency: z.string().length(3),
  paymentMethodId: z.string().min(1),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive().max(1000000).multipleOf(0.01),
  currency: z.string().length(3),
  bankAccountId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

export const createEscrowSchema = z.object({
  applicationId: uuidSchema,
  amount: z.number().positive().max(1000000).multipleOf(0.01),
  idempotencyKey: z.string().uuid(),
});

export const disputeEscrowSchema = z.object({
  reason: z.string().min(20).max(2000),
  evidence: z.string().max(5000).optional(),
});

export type WalletTopupDto = z.infer<typeof walletTopupSchema>;
export type WithdrawalDto = z.infer<typeof withdrawalSchema>;
export type CreateEscrowDto = z.infer<typeof createEscrowSchema>;
export type DisputeEscrowDto = z.infer<typeof disputeEscrowSchema>;

// ─── Review Schemas ───────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000).optional().nullable(),
  isPublic: z.boolean().default(true),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;

// ─── Message Schemas ──────────────────────────────────────────────────────────

export const createConversationSchema = z.object({
  participantId: uuidSchema,
  jobId: uuidSchema.optional().nullable(),
  initialMessage: z.string().min(1).max(5000).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachmentIds: z.array(uuidSchema).max(10).optional(),
});

export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;

// ─── Search Schemas ───────────────────────────────────────────────────────────

export const globalSearchSchema = z.object({
  q: z.string().min(2).max(200),
  type: z.enum(['jobs', 'workers', 'employers', 'all']).default('all'),
  ...paginationSchema.shape,
});

export type GlobalSearchDto = z.infer<typeof globalSearchSchema>;

// ─── AI Schemas ───────────────────────────────────────────────────────────────

export const assistantMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export const optimiseJdSchema = z.object({
  jobTitle: z.string().min(2).max(200),
  description: z.string().min(50).max(10000),
  targetRole: z.string().min(2).max(100).optional(),
});

export type AssistantMessageDto = z.infer<typeof assistantMessageSchema>;
export type OptimiseJdDto = z.infer<typeof optimiseJdSchema>;
