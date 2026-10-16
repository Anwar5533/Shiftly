import { PrismaClient, UserRole, JobType, SalaryPeriod } from '@prisma/client-analytics-service';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5433/shiftly';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

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

  const createdUsers: Record<string, any> = {};

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
        wallet: { create: { currency: 'INR' } },
      },
    });
    createdUsers[account.role] = user;
    console.log(`Upserted ${account.role} user: ${account.email}`);
  }

  // Create Employer Profile
  const employerUser = createdUsers[UserRole.EMPLOYER];
  let employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: employerUser.id },
  });
  if (!employerProfile) {
    try {
      employerProfile = await prisma.employerProfile.create({
        data: {
          userId: employerUser.id,
          companyName: 'Tech Innovators Inc.',
          industry: 'Technology',
          location: { city: 'Bangalore', country: 'India' },
          isVerified: true,
        },
      });
      console.log('Created Employer Profile');
    } catch (err: any) {
      if (err.code === 'P2002') {
        employerProfile = await prisma.employerProfile.findUnique({
          where: { userId: employerUser.id },
        });
      } else {
        throw err;
      }
    }
  }

  // Create Worker Profile
  const workerUser = createdUsers[UserRole.WORKER];
  let workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: workerUser.id },
  });
  if (!workerProfile) {
    try {
      workerProfile = await prisma.workerProfile.create({
        data: {
          userId: workerUser.id,
          firstName: 'John',
          lastName: 'Doe',
          location: { city: 'Bangalore', country: 'India' },
          isVerified: true,
        },
      });
      console.log('Created Worker Profile');
    } catch (err: any) {
      if (err.code === 'P2002') {
        workerProfile = await prisma.workerProfile.findUnique({
          where: { userId: workerUser.id },
        });
      } else {
        throw err;
      }
    }
  }

  // Create Recruiter Profile
  const recruiterUser = createdUsers[UserRole.RECRUITER];
  let recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: recruiterUser.id },
  });
  if (!recruiterProfile) {
    try {
      recruiterProfile = await prisma.recruiterProfile.create({
        data: {
          userId: recruiterUser.id,
          firstName: 'Alice',
          lastName: 'Smith',
          agencyName: 'Top Talent Agency',
          specialisations: ['IT', 'Engineering'],
          isVerified: true,
        },
      });
      console.log('Created Recruiter Profile');
    } catch (err: any) {
      if (err.code === 'P2002') {
        recruiterProfile = await prisma.recruiterProfile.findUnique({
          where: { userId: recruiterUser.id },
        });
      } else {
        throw err;
      }
    }
  }

  // Create Sample Job
  let job = employerProfile
    ? await prisma.job.findFirst({
        where: { employerId: employerProfile.id },
      })
    : null;
  if (!job && employerProfile) {
    try {
      job = await prisma.job.create({
        data: {
          employerId: employerProfile.id,
          title: 'Senior Frontend Developer',
          description: 'Looking for an experienced React developer to join our team.',
          jobType: JobType.PERMANENT,
          status: 'PUBLISHED',
          location: { city: 'Bangalore', country: 'India' },
          isRemote: true,
          salaryMin: 1500000,
          salaryMax: 2500000,
          salaryCurrency: 'INR',
          salaryPeriod: SalaryPeriod.ANNUAL,
          startDate: new Date(),
          publishedAt: new Date(),
        },
      });
      console.log('Created Sample Job');
    } catch (err: any) {
      if (err.code === 'P2002') {
        job = await prisma.job.findFirst({
          where: { employerId: employerProfile.id },
        });
      } else {
        throw err;
      }
    }
  }

  // Create Sample Application
  if (job && workerProfile) {
    try {
      const existingApp = await prisma.jobApplication.findFirst({
        where: { jobId: job.id, workerId: workerProfile.id },
      });
      if (!existingApp) {
        await prisma.jobApplication.create({
          data: {
            jobId: job.id,
            workerId: workerProfile.id,
            status: 'PENDING',
            coverLetter: 'I am very interested in this role and have 5 years of experience in React.',
          },
        });
        console.log('Created Sample Application');
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log('Sample Application already exists (concurrent seed)');
      } else {
        throw err;
      }
    }
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
