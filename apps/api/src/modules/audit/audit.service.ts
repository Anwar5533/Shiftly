import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async logEvent(
    action: string,
    actorId: string,
    details?: any,
    severity: string = 'INFO',
  ) {
    // For now, we'll store audit logs in a simple JSON array or just return them if we don't have a table.
    // Wait, let's see if we have an AuditLog table in schema.prisma.
    // If not, we can mock the fetching part and log to console for now.
    console.log(`[AUDIT] ${severity} - ${action} by ${actorId}`, details);
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async getLogs() {
    // Mock audit logs since we don't have an AuditLog table in the initial schema
    return [
      {
        id: '1',
        action: 'KYC_APPROVED',
        actorEmail: 'admin@shiftly.com',
        target: 'user_123',
        timestamp: new Date(),
        severity: 'INFO',
      },
      {
        id: '2',
        action: 'TIMESHEET_REJECTED',
        actorEmail: 'employer@acme.com',
        target: 'timesheet_456',
        timestamp: new Date(Date.now() - 3600000),
        severity: 'WARNING',
      },
      {
        id: '3',
        action: 'PAYMENT_PROCESSED',
        actorEmail: 'system',
        target: 'payment_789',
        timestamp: new Date(Date.now() - 7200000),
        severity: 'INFO',
      },
      {
        id: '4',
        action: 'FAILED_LOGIN',
        actorEmail: 'unknown',
        target: 'admin@shiftly.com',
        timestamp: new Date(Date.now() - 86400000),
        severity: 'CRITICAL',
      },
    ];
  }
}
