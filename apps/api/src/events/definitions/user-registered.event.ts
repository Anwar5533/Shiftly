import { User } from '@prisma/client-api';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
