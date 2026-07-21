import fs from 'fs';

const BASE_URL = 'http://localhost:3001/api/v1';
let authToken = '';

async function runE2E() {
  console.log('--- STARTING E2E JOURNEY ---');

  // 1. Request OTP
  console.log('\\n1. Requesting OTP...');
  const phone = '+15550001234';
  const otpRes = await fetch(`${BASE_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  console.log('OTP Send Status:', otpRes.status);
  if (!otpRes.ok) {
    console.log(await otpRes.text());
    throw new Error('Failed to send OTP');
  }

  // 2. Verify OTP
  console.log('\\n2. Verifying OTP...');
  const verifyRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp: '123456' }),
  });
  console.log('OTP Verify Status:', verifyRes.status);
  if (!verifyRes.ok) {
    console.log(await verifyRes.text());
    throw new Error('Failed to verify OTP');
  }
  
  const verifyData = await verifyRes.json();
  authToken = verifyData.data.accessToken;
  console.log('Received Access Token:', authToken.substring(0, 20) + '...');

  // 3. Decode JWT to get user ID and Role
  console.log('\\n3. Decoding JWT...');
  const base64Url = authToken.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  const jwtPayload = JSON.parse(jsonPayload);
  console.log('JWT Payload:', jwtPayload);

  let userId = jwtPayload.sub;
  let userRole = jwtPayload.role;

  // Let's create a job! If role is WORKER, this might fail, but let's try.
  console.log('\\n4. Creating Job...');
  const jobPayload = {
    title: 'E2E Test Job',
    description: 'A job created during E2E testing',
    jobType: 'SHIFT',
    location: {
      address: '123 Test St',
      city: 'Testville',
      state: 'CA',
      country: 'USA',
      zip: '12345',
    },
    salaryMin: 20,
    salaryMax: 30,
    startDate: new Date(Date.now() + 86400000).toISOString(),
    positionsTotal: 2,
  };

  const jobRes = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` 
    },
    body: JSON.stringify(jobPayload),
  });
  console.log('Create Job Status:', jobRes.status);
  let jobId = null;
  if (jobRes.ok) {
    const jobData = await jobRes.json();
    jobId = jobData.data.id;
    console.log('Job created with ID:', jobId);
  } else {
    console.log('Failed to create job:', await jobRes.text());
  }

  // 5. Get the Job Details
  if (jobId) {
    console.log('\\n5. Getting Job Details...');
    const getJobRes = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    console.log('Get Job Status:', getJobRes.status);
    const getJobData = await getJobRes.json();
    console.log('Job Title:', getJobData.data.title);
  }

  console.log('\\n--- E2E JOURNEY COMPLETE ---');
}

runE2E().catch(console.error);
