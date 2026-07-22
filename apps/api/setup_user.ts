import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const phone = '+15550001234';

  // Create user directly via Prisma if doesn't exist
  let user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        role: 'EMPLOYER',
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'EMPLOYER' },
    });
  }

  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!employerProfile) {
    await prisma.employerProfile.create({
      data: {
        userId: user.id,
        companyName: 'E2E Corp',
        industry: 'Tech',
        location: 'Remote',
      },
    });
  }

  console.log('User configured as EMPLOYER:', user.id);
  await prisma.$disconnect();
}

main().catch(console.error);
