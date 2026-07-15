-- CreateEnum
CREATE TYPE "StatementFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "dunningLastSentAt" TIMESTAMP(3),
ADD COLUMN     "dunningLevel" INTEGER;

-- AlterTable
ALTER TABLE "company_settings" ADD COLUMN     "statementDayOfMonth" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "statementEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statementFrequency" "StatementFrequency" NOT NULL DEFAULT 'MONTHLY';

-- CreateTable
CREATE TABLE "StatementSchedule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "frequency" "StatementFrequency" NOT NULL DEFAULT 'MONTHLY',
    "dayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "lastSentAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "recipientEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatementSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatementSchedule_companyId_isActive_nextRunDate_idx" ON "StatementSchedule"("companyId", "isActive", "nextRunDate");

-- CreateIndex
CREATE UNIQUE INDEX "StatementSchedule_companyId_customerId_key" ON "StatementSchedule"("companyId", "customerId");

-- AddForeignKey
ALTER TABLE "StatementSchedule" ADD CONSTRAINT "StatementSchedule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementSchedule" ADD CONSTRAINT "StatementSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementSchedule" ADD CONSTRAINT "StatementSchedule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;
