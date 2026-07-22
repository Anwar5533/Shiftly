import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const workers = await prisma.user.findMany({
    where: { role: 'WORKER', workerProfile: null },
  });

  for (const worker of workers) {
    await prisma.workerProfile.create({
      data: {
        userId: worker.id,
        firstName: 'New',
        lastName: 'Worker',
        location: { city: 'Bangalore', country: 'India' },
      },
    });
    console.log(`Created profile for ${worker.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
