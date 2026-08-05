import { PrismaClient } from '@prisma/client-jobs-service';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting jobs-service seed...');

  // Minimal seed logic for isolated microservice

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
