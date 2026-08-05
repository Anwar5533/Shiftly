import { User } from '@prisma/client-search-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
