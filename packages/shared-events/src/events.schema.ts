import { z } from 'zod';
import { BaseEventSchema } from './base.schema';

export const ApplicationHiredEventSchema = BaseEventSchema.extend({
  type: z.literal('application.hired'),
  payload: z.object({
    applicationId: z.string(),
    jobId: z.string(),
    workerId: z.string(),
    employerId: z.string(),
  }),
});

export const PaymentReleasedEventSchema = BaseEventSchema.extend({
  type: z.literal('payment.released'),
  payload: z.object({
    escrowLockId: z.string(),
    jobId: z.string(),
    applicationId: z.string(),
    workerId: z.string(),
    amount: z.number(),
  }),
});

export const ShiftCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal('shift.completed'),
  payload: z.object({
    shiftId: z.string(),
    jobId: z.string(),
    workerId: z.string(),
  }),
});

export const UserRegisteredEventSchema = BaseEventSchema.extend({
  type: z.literal('user.registered'),
  payload: z.object({
    userId: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
});

export type ApplicationHiredEvent = z.infer<typeof ApplicationHiredEventSchema>;
export type PaymentReleasedEvent = z.infer<typeof PaymentReleasedEventSchema>;
export type ShiftCompletedEvent = z.infer<typeof ShiftCompletedEventSchema>;
export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;
