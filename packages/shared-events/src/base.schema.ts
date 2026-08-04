import { z } from 'zod';

export const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  traceId: z.string().uuid(),
  correlationId: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  version: z.string().default('1.0'),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
