import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ApplicationsService } from './src/modules/applications/applications.service';
import { PrismaService } from './src/infrastructure/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const applicationsService = app.get(ApplicationsService);

  const jobId = '760c039c-5bb3-4442-b172-916fbab46082';
  
  const workerUser = await prisma.user.findFirst({
    where: { role: 'WORKER' },
    orderBy: { createdAt: 'desc' },
    include: { workerProfile: true }
  });

  console.log(`Worker: ${workerUser?.id}`);
  
  if (workerUser) {
    try {
      const res = await applicationsService.applyToJob(workerUser.id, { jobId, coverLetter: 'Testing directly' });
      console.log('Success:', res);
    } catch (e: any) {
      console.log('Error applying:');
      console.log(e?.message, e?.response);
    }
  }

  await app.close();
}

main().catch(console.error);
