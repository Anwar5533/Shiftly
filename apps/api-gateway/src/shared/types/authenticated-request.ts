import { Request } from 'express';

/**
 * Shape `JwtStrategy.validate()` attaches to the request. Declared once so
 * controllers can drop `req: any` and keep IDOR checks type-checked.
 */
export interface AuthenticatedUser {
  userId: string;
  role: string;
  email?: string;
  permissions?: string[];
  sessionId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/** Roles allowed to read platform-wide admin aggregates. */
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;
