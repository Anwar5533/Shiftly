import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  // 1. Upsert Employer
  await prisma.user.upsert({
    where: { email: 'employer@shiftly.com' },
    update: { passwordHash: password },
    create: {
      email: 'employer@shiftly.com',
      phone: '9999999991',
      passwordHash: password,
      role: UserRole.EMPLOYER,
      isEmailVerified: true,
      wallet: { create: { currency: 'INR' } },
      referralCode: { create: { code: 'EMP123' } },
      employerProfile: {
        create: {
          companyName: 'Shiftly Corp',
          industry: 'Technology',
          location: { city: 'Bangalore' },
        },
      },
    },
  });

  // 2. Upsert Worker
  await prisma.user.upsert({
    where: { email: 'worker@shiftly.com' },
    update: { passwordHash: password },
    create: {
      email: 'worker@shiftly.com',
      phone: '9999999992',
      passwordHash: password,
      role: UserRole.WORKER,
      isEmailVerified: true,
      wallet: { create: { currency: 'INR' } },
      referralCode: { create: { code: 'WRK123' } },
      workerProfile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          location: { city: 'Bangalore' },
        },
      },
    },
  });

  console.log('Test users seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
