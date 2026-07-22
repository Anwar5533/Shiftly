import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jobId = '760c039c-5bb3-4442-b172-916fbab46082';
  
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  console.log('Job:', job ? 'Exists' : 'Not Found', job?.status, job?.deletedAt ? 'Deleted' : 'Active');
  
  if (job) {
    console.log('Positions:', job.positionsFilled, '/', job.positionsTotal);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
