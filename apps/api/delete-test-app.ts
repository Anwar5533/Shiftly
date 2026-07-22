import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jobId = '760c039c-5bb3-4442-b172-916fbab46082';
  
  // Find the latest worker
  const workerUser = await prisma.user.findFirst({
    where: { role: 'WORKER' },
    orderBy: { createdAt: 'desc' },
    include: { workerProfile: true }
  });

  if (!workerUser?.workerProfile) {
    console.log('No worker found');
    return;
  }

  // Delete the application so the user can test it themselves
  const deleted = await prisma.jobApplication.deleteMany({
    where: {
      jobId: jobId,
      workerId: workerUser.workerProfile.id,
    },
  });

  console.log('Deleted applications:', deleted.count);
  
  // Also decrease the applicationCount on the job so it's consistent
  if (deleted.count > 0) {
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { decrement: deleted.count } },
    });
    console.log('Decremented applicationCount on job');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
