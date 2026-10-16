CREATE SCHEMA IF NOT EXISTS "users";

CREATE TABLE IF NOT EXISTS "users"."outbox_events" (
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
ALTER TABLE "users"."outbox_events" ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users"."outbox_events" ADD COLUMN IF NOT EXISTS "lastRetryAt" TIMESTAMP(3);

