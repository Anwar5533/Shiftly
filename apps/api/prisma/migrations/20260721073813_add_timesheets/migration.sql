-- CreateEnum
CREATE TYPE "jobs"."TimesheetStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "jobs"."timesheets" (
    "id" UUID NOT NULL,
    "shiftId" UUID NOT NULL,
    "status" "jobs"."TimesheetStatus" NOT NULL DEFAULT 'PENDING',
    "hoursWorked" DECIMAL(6,2) NOT NULL,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_shiftId_key" ON "jobs"."timesheets"("shiftId");

-- CreateIndex
CREATE INDEX "timesheets_status_idx" ON "jobs"."timesheets"("status");

-- AddForeignKey
ALTER TABLE "jobs"."timesheets" ADD CONSTRAINT "timesheets_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "jobs"."shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
