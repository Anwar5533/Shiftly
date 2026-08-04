export class UserRegisteredEvent {
  constructor(
    public readonly user: {
      id: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    },
  ) {}
}
