-- CreateEnum
CREATE TYPE "FirmDataType" AS ENUM ('INTERNAL_NOTE', 'AUTOMATION_RULE', 'AI_TEMPLATE', 'DASHBOARD_CONFIG');

-- CreateEnum
CREATE TYPE "FirmRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('INVITED', 'PENDING', 'ACCEPTED', 'REVOKED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "AccountingFirm" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingFirm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmData" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "type" "FirmDataType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirmData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFirmAccess" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "role" "FirmRole" NOT NULL,
    "status" "AccessStatus" NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "CompanyFirmAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingFirmSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountingFirmId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "AccountingFirmSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountingFirm_tenantId_idx" ON "AccountingFirm"("tenantId");

-- CreateIndex
CREATE INDEX "FirmData_tenantId_accountingFirmId_idx" ON "FirmData"("tenantId", "accountingFirmId");

-- CreateIndex
CREATE INDEX "CompanyFirmAccess_tenantId_companyId_idx" ON "CompanyFirmAccess"("tenantId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFirmAccess_companyId_accountingFirmId_key" ON "CompanyFirmAccess"("companyId", "accountingFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingFirmSubscription_accountingFirmId_key" ON "AccountingFirmSubscription"("accountingFirmId");

-- AddForeignKey
ALTER TABLE "AccountingFirm" ADD CONSTRAINT "AccountingFirm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmData" ADD CONSTRAINT "FirmData_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmData" ADD CONSTRAINT "FirmData_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFirmAccess" ADD CONSTRAINT "CompanyFirmAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingFirmSubscription" ADD CONSTRAINT "AccountingFirmSubscription_accountingFirmId_fkey" FOREIGN KEY ("accountingFirmId") REFERENCES "AccountingFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingFirmSubscription" ADD CONSTRAINT "AccountingFirmSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
