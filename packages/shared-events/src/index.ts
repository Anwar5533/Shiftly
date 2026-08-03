export interface EventMessage<T = any> {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  source: string;
  correlationId?: string;
  data: T;
}

// Event Types
export enum IdentityEventTypes {
  USER_REGISTERED = 'identity.user.registered.v1',
  USER_LOGGED_IN = 'identity.user.logged_in.v1',
}

export enum JobEventTypes {
  JOB_CREATED = 'jobs.job.created.v1',
  JOB_PUBLISHED = 'jobs.job.published.v1',
}

export enum ApplicationEventTypes {
  APPLICATION_SUBMITTED = 'applications.application.submitted.v1',
  APPLICATION_STATUS_CHANGED = 'applications.application.status_changed.v1',
}

export enum PaymentEventTypes {
  PAYMENT_PROCESSED = 'payments.payment.processed.v1',
  ESCROW_LOCKED = 'payments.escrow.locked.v1',
}

// Example Data Payloads
export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
}

export interface JobPublishedPayload {
  jobId: string;
  employerId: string;
}

export interface ApplicationSubmittedPayload {
  applicationId: string;
  jobId: string;
  workerId: string;
}
