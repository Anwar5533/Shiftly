import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.job.findMany();
  jobs.forEach(j => {
    console.log(`Title: ${j.title}`);
    console.log(`Desc: ${j.description?.substring(0, 50)}...`);
  });
}
main().finally(() => prisma.$disconnect());
