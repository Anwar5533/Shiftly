-- Add employerId to job_applications
ALTER TABLE "jobs"."job_applications" ADD COLUMN IF NOT EXISTS "employerId" UUID;
CREATE SCHEMA IF NOT EXISTS "applications";
CREATE TABLE IF NOT EXISTS "applications"."outbox_events" (
  "id" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "error" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "lastRetryAt" TIMESTAMP(3),
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "applications"."outbox_events" ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "applications"."outbox_events" ADD COLUMN IF NOT EXISTS "lastRetryAt" TIMESTAMP(3);

