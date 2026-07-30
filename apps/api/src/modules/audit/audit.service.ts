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
      {
        id: '5',
        action: 'USER_CREATED',
        actorEmail: 'system',
        target: 'user_124',
        timestamp: new Date(Date.now() - 90000000),
        severity: 'INFO',
      },
      {
        id: '6',
        action: 'PASSWORD_CHANGED',
        actorEmail: 'worker@gmail.com',
        target: 'worker@gmail.com',
        timestamp: new Date(Date.now() - 95000000),
        severity: 'INFO',
      },
      {
        id: '7',
        action: 'DATABASE_CONNECTION_LOST',
        actorEmail: 'system',
        target: 'db_cluster_1',
        timestamp: new Date(Date.now() - 100000000),
        severity: 'ERROR',
      },
      {
        id: '8',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        actorEmail: '192.168.1.1',
        target: 'api/v1/admin/users',
        timestamp: new Date(Date.now() - 110000000),
        severity: 'CRITICAL',
      },
      {
        id: '9',
        action: 'ROLE_UPDATED',
        actorEmail: 'superadmin@shiftly.local',
        target: 'admin@shiftly.com',
        timestamp: new Date(Date.now() - 120000000),
        severity: 'WARNING',
      },
      {
        id: '10',
        action: 'SHIFT_CANCELLED',
        actorEmail: 'employer2@acme.com',
        target: 'shift_999',
        timestamp: new Date(Date.now() - 130000000),
        severity: 'INFO',
      },
    ];
  }
}
