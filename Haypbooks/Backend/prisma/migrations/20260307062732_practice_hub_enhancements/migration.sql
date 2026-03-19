/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `PracticeUser` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `PracticeUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "PracticeUser" ADD COLUMN     "id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PracticeRoleRate" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "hourlyRate" DECIMAL(19,4) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consolidationGroupId" TEXT,

    CONSTRAINT "PracticeRoleRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementTimeEntry" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "practiceUserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(19,4) NOT NULL,
    "notes" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "hourlyRateApplied" DECIMAL(19,4) NOT NULL,
    "wipStatus" TEXT NOT NULL DEFAULT 'UNBILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeWipLedger" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "unbilledHours" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "unbilledAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "billedAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "writeOffAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consolidationGroupId" TEXT,

    CONSTRAINT "PracticeWipLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeClientLead" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "estimatedValue" DECIMAL(19,4),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consolidationGroupId" TEXT,

    CONSTRAINT "PracticeClientLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeRoleRate_practiceId_isActive_idx" ON "PracticeRoleRate"("practiceId", "isActive");

-- CreateIndex
CREATE INDEX "EngagementTimeEntry_engagementId_wipStatus_idx" ON "EngagementTimeEntry"("engagementId", "wipStatus");

-- CreateIndex
CREATE INDEX "EngagementTimeEntry_practiceUserId_date_idx" ON "EngagementTimeEntry"("practiceUserId", "date");

-- CreateIndex
CREATE INDEX "PracticeWipLedger_practiceId_period_idx" ON "PracticeWipLedger"("practiceId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeWipLedger_engagementId_period_key" ON "PracticeWipLedger"("engagementId", "period");

-- CreateIndex
CREATE INDEX "PracticeClientLead_practiceId_status_idx" ON "PracticeClientLead"("practiceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeUser_id_key" ON "PracticeUser"("id");

-- AddForeignKey
ALTER TABLE "PracticeRoleRate" ADD CONSTRAINT "PracticeRoleRate_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeRoleRate" ADD CONSTRAINT "PracticeRoleRate_consolidationGroupId_fkey" FOREIGN KEY ("consolidationGroupId") REFERENCES "ConsolidationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementTimeEntry" ADD CONSTRAINT "EngagementTimeEntry_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementTimeEntry" ADD CONSTRAINT "EngagementTimeEntry_practiceUserId_fkey" FOREIGN KEY ("practiceUserId") REFERENCES "PracticeUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWipLedger" ADD CONSTRAINT "PracticeWipLedger_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWipLedger" ADD CONSTRAINT "PracticeWipLedger_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeWipLedger" ADD CONSTRAINT "PracticeWipLedger_consolidationGroupId_fkey" FOREIGN KEY ("consolidationGroupId") REFERENCES "ConsolidationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeClientLead" ADD CONSTRAINT "PracticeClientLead_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeClientLead" ADD CONSTRAINT "PracticeClientLead_consolidationGroupId_fkey" FOREIGN KEY ("consolidationGroupId") REFERENCES "ConsolidationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
