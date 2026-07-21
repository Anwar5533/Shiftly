-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "identity"."users"("role", "status");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "identity"."users"("deletedAt");

-- CreateIndex
CREATE INDEX "job_applications_jobId_status_idx" ON "jobs"."job_applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "jobs_employerId_status_idx" ON "jobs"."jobs"("employerId", "status");

-- CreateIndex
CREATE INDEX "jobs_status_jobType_idx" ON "jobs"."jobs"("status", "jobType");

-- CreateIndex
CREATE INDEX "jobs_deletedAt_idx" ON "jobs"."jobs"("deletedAt");

-- CreateIndex
CREATE INDEX "shifts_scheduledStart_scheduledEnd_idx" ON "jobs"."shifts"("scheduledStart", "scheduledEnd");

-- CreateIndex
CREATE INDEX "escrow_locks_jobId_status_idx" ON "payments"."escrow_locks"("jobId", "status");

-- CreateIndex
CREATE INDEX "escrow_locks_walletId_status_idx" ON "payments"."escrow_locks"("walletId", "status");

-- CreateIndex
CREATE INDEX "transactions_walletId_status_idx" ON "payments"."transactions"("walletId", "status");

-- CreateIndex
CREATE INDEX "transactions_walletId_createdAt_idx" ON "payments"."transactions"("walletId", "createdAt" DESC);
