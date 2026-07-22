import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.job.findMany();
  jobs.forEach(j => console.log(j.title));
}
main().finally(() => prisma.$disconnect());
