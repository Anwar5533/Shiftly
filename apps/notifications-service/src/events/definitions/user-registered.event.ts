import { User } from '@prisma/client-notifications-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
