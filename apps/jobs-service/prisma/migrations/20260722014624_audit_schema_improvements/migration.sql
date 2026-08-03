/*
  Warnings:

  - Added the required column `updatedAt` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `worker_certifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "employers"."employer_profiles_userId_idx";

-- DropIndex
DROP INDEX "messaging"."messages_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "recruiters"."recruiter_profiles_userId_idx";

-- DropIndex
DROP INDEX "workers"."worker_profiles_userId_idx";

-- AlterTable
ALTER TABLE "employers"."departments" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "employers"."employer_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "recruiters"."recruiter_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workers"."skills" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workers"."worker_certifications" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workers"."worker_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "job_applications_workerId_status_appliedAt_idx" ON "jobs"."job_applications"("workerId", "status", "appliedAt" DESC);

-- CreateIndex
CREATE INDEX "jobs_employerId_createdAt_idx" ON "jobs"."jobs"("employerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messaging"."messages"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"."notifications"("userId", "createdAt" DESC);
