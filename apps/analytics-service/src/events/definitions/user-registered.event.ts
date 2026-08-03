import { User } from '@prisma/client';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
