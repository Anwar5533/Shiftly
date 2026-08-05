import { User } from '@prisma/client-payments-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
