import { User } from '@prisma/client-documents-service';

export class UserRegisteredEvent {
  constructor(public readonly user: User) {}
}
