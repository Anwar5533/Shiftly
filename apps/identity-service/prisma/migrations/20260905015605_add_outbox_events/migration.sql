/*
  Warnings:

  - You are about to drop the column `referredBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `push_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "identity"."push_tokens" DROP CONSTRAINT "push_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "identity"."users" DROP CONSTRAINT "users_referredBy_fkey";

-- AlterTable
ALTER TABLE "identity"."users" DROP COLUMN "referredBy";

-- DropTable
DROP TABLE "identity"."push_tokens";

-- CreateTable
CREATE TABLE IF NOT EXISTS "identity"."outbox_events" (
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
ALTER TABLE "identity"."outbox_events" ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "identity"."outbox_events" ADD COLUMN IF NOT EXISTS "lastRetryAt" TIMESTAMP(3);

