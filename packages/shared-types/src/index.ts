// ─── User & Auth Types ───────────────────────────────────────────────────────

export type UserRole = 'WORKER' | 'EMPLOYER' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus =
  'ACTIVE' | 'SUSPENDED' | 'PENDING_KYC' | 'PENDING_VERIFICATION' | 'DELETED';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  workerProfile?: WorkerProfile;
  employerProfile?: EmployerProfile;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string | null;
  role: UserRole;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobType = 'SHIFT' | 'PERMANENT' | 'GIG';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'CANCELLED' | 'ARCHIVED' | 'EXPIRED';

export type ApplicationStatus =
  'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';

export type TimesheetStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface JobLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isRemote: boolean;
}

export interface Job {
  id: string;
  employerId: string;
  recruiterId: string | null;
  title: string;
  description: string;
  jobType: JobType;
  status: JobStatus;
  location: JobLocation;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL' | 'FIXED';
  skillsRequired: string[];
  startDate: string;
  endDate: string | null;
  shiftDurationHours: number | null;
  positionsTotal: number;
  positionsFilled: number;
  aiMatchScore?: number;
  createdAt: string;
  updatedAt: string;
  employer?: EmployerProfile;
  timesheet?: Timesheet;
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  aiScore: number | null;
  appliedAt: string;
  updatedAt: string;
}

export interface Timesheet {
  id: string;
  shiftId: string;
  status: TimesheetStatus;
  hoursWorked: number;
  notes?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Worker Types ─────────────────────────────────────────────────────────────

export type AvailabilityType = 'FULL_TIME' | 'PART_TIME' | 'WEEKENDS' | 'FLEXIBLE';

export interface WorkerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: Omit<JobLocation, 'isRemote'>;
  skills: string[];
  experienceYears: number;
  availability: AvailabilityType;
  hourlyRate: number | null;
  currency: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Employer Types ───────────────────────────────────────────────────────────

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  location: Omit<JobLocation, 'isRemote'>;
  employeeCount: EmployeeCountRange;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeCountRange = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

// ─── Payment Types ────────────────────────────────────────────────────────────

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAWAL'
  | 'ESCROW_LOCK'
  | 'ESCROW_RELEASE'
  | 'ESCROW_REFUND'
  | 'PLATFORM_FEE'
  | 'REFERRAL_BONUS';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export type EscrowStatus = 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  currency: string;
  isFrozen: boolean;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  referenceId: string | null;
  description: string;
  createdAt: string;
}

export interface EscrowLock {
  id: string;
  walletId: string;
  jobId: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  lockedAt: string;
  releasedAt: string | null;
}

// ─── KYC Types ────────────────────────────────────────────────────────────────

export type KycStatus =
  'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type DocumentType =
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'DRIVERS_LICENSE'
  | 'RESIDENCE_PERMIT'
  | 'PROOF_OF_ADDRESS'
  | 'BUSINESS_REGISTRATION'
  | 'RESUME';

export interface KycDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export type ReviewTarget = 'WORKER' | 'EMPLOYER';

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  targetType: ReviewTarget;
  rating: number; // 1-5
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type NotificationType =
  | 'JOB_MATCH'
  | 'APPLICATION_UPDATE'
  | 'SHIFT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_SENT'
  | 'KYC_UPDATE'
  | 'CHAT_MESSAGE'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  lastReadAt?: string;
  joinedAt: string;
  user?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  sender?: User;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// ─── Subscription Types ───────────────────────────────────────────────────────

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: ValidationErrorDetail[];
    statusCode: number;
  };
  meta: ResponseMeta;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface ResumeParseResult {
  fullName: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experienceYears: number;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  languages: string[];
  summary: string | null;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
}

export interface ResumeExperience {
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface CandidateMatch {
  workerId: string;
  score: number; // 0-100
  breakdown: MatchBreakdown;
  worker?: WorkerProfile;
}

export interface MatchBreakdown {
  skillsScore: number;
  locationScore: number;
  experienceScore: number;
  availabilityScore: number;
  ratingScore: number;
  responseRateScore: number;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}
