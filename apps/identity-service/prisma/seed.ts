import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.env.DATABASE_URL) {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

import { PrismaClient, UserRole } from '@prisma/client-identity-service';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting identity-service seed...');

  const commonPasswordHash = await bcrypt.hash('Password-123!', 12);
  const superAdminPasswordHash = await bcrypt.hash('Anwar@Kornipalli-123', 12);

  const testAccounts = [
    {
      email: 'superadmin@shiftly.local',
      role: UserRole.SUPER_ADMIN,
      phone: '+919000000000',
      passwordHash: superAdminPasswordHash,
    },
    {
      email: 'admin@shiftly.local',
      role: UserRole.ADMIN,
      phone: '+919000000001',
      passwordHash: commonPasswordHash,
    },
    {
      email: 'recruiter@shiftly.local',
      role: UserRole.RECRUITER,
      phone: '+919000000002',
      passwordHash: commonPasswordHash,
    },
    {
      email: 'employer@shiftly.local',
      role: UserRole.EMPLOYER,
      phone: '+919000000003',
      passwordHash: commonPasswordHash,
    },
    {
      email: 'worker@shiftly.local',
      role: UserRole.WORKER,
      phone: '+919000000004',
      passwordHash: commonPasswordHash,
    },
  ];

  for (const account of testAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        passwordHash: account.passwordHash,
        phone: account.phone,
      },
      create: {
        email: account.email,
        phone: account.phone,
        passwordHash: account.passwordHash,
        role: account.role,
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'ACTIVE',
      },
    });
    console.log(`Upserted ${account.role} user: ${account.email}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
