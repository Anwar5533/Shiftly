import { PrismaClient } from '@prisma/client-applications-service';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting applications-service seed...');

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
