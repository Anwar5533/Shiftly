import { User } from '@prisma/client-analytics-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
