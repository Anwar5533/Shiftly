CREATE SCHEMA IF NOT EXISTS "payments";

CREATE TABLE IF NOT EXISTS "payments"."outbox_events" (
  "id" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "error" TEXT,
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);
