# SHIFTLY Secret Rotation Runbook

## Overview

This document outlines the standard operating procedure for rotating critical secrets in the Shiftly infrastructure with zero downtime.

## 1. JWT Secret Rotation (JWT_SECRET / JWT_ACCESS_SECRET)

To prevent invalidating active user sessions when rotating JWT secrets, we implement a graceful transition period.

**Steps:**

1. Generate a new secure 256-bit secret.
2. In the environment configuration, assign the _old_ secret to `JWT_PREVIOUS_SECRET` (if your authentication guard supports falling back to verify old tokens).
3. Assign the _new_ secret to `JWT_SECRET`.
4. Deploy the application. New tokens will be signed with `JWT_SECRET`. Old tokens will be verified against `JWT_SECRET` and then `JWT_PREVIOUS_SECRET`.
5. After the token expiry duration (e.g., 24 hours), remove `JWT_PREVIOUS_SECRET` and redeploy.

## 2. Database Password Rotation (DATABASE_URL)

Shiftly relies on Prisma. To rotate the database password without downtime:

1. Create a second database user/password with identical privileges in PostgreSQL.
2. Update the `DATABASE_URL` in the environment to point to the new user.
3. Perform a rolling restart of all Shiftly microservices.
4. Once all active connections from the old user have drained, delete the old database user.

## 3. Third-Party API Keys (AWS, Stripe, etc.)

1. Generate the new key in the provider's dashboard.
2. Update the environment variables in the CI/CD pipeline / Secret Manager.
3. Trigger a deployment / rolling restart.
4. Verify functionality and then revoke the old key in the provider's dashboard.
