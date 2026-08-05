import { User } from '@prisma/client-identity-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
