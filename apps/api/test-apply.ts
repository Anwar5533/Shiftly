import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jobId = '760c039c-5bb3-4442-b172-916fbab46082';
  
  const workerUser = await prisma.user.findFirst({
    where: { role: 'WORKER' },
    orderBy: { createdAt: 'desc' },
    include: { workerProfile: true }
  });
  
  console.log('Worker User:', workerUser?.id);
  console.log('Worker Profile:', workerUser?.workerProfile?.id);

  if (!workerUser?.workerProfile) {
    console.log('No worker profile found!');
    return;
  }

  const existingApp = await prisma.jobApplication.findUnique({
    where: {
      jobId_workerId: {
        jobId: jobId,
        workerId: workerUser.workerProfile.id,
      },
    },
  });

  if (existingApp) {
    console.log('Already applied!');
  } else {
    console.log('Can apply');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
