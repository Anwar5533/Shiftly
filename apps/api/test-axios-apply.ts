import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const jobId = '760c039c-5bb3-4442-b172-916fbab46082';
  
  // Find the latest worker
  const workerUser = await prisma.user.findFirst({
    where: { role: 'WORKER' },
    orderBy: { createdAt: 'desc' },
  });

  if (!workerUser) {
    console.log('No worker found');
    return;
  }

  // Create token
  const jti = uuidv4();
  const accessToken = jwt.sign(
    {
      sub: workerUser.id,
      email: workerUser.email,
      role: workerUser.role,
      permissions: [],
      sessionId: jti,
    },
    'CHANGE_ME_USE_OPENSSL_RAND_HEX_32_FOR_PRODUCTION_MINIMUM_32_CHARS', // From .env
    { expiresIn: '15m' }
  );

  console.log(`Trying to apply as ${workerUser.id}`);

  try {
    const res = await axios.post(
      'http://localhost:3001/api/v1/applications',
      { jobId, coverLetter: 'Test script applying' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Success:', res.data);
  } catch (err: any) {
    console.log('Error applying:');
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
    } else {
      console.log(err.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
