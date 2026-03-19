-- CreateEnum
CREATE TYPE "PracticeTier" AS ENUM ('BEGINNER', 'APPRENTICE', 'PRACTITIONER', 'EXPERT', 'MASTER');

-- CreateEnum
CREATE TYPE "PracticePremiumTool" AS ENUM ('AI_BOOKKEEPING', 'SMART_MATCHING', 'ADVANCED_AUTOMATION', 'CLIENT_PORTAL', 'ANALYTICS_PRO');

-- CreateEnum
CREATE TYPE "ToolUnlockMethod" AS ENUM ('XP_MILESTONE', 'PREMIUM_SUBSCRIPTION', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('LEVEL_1_CORE', 'LEVEL_2_ADVANCED', 'LEVEL_3_PAYROLL_TAX', 'LEVEL_4_ADVISORY');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_countryId_fkey";

-- DropIndex
DROP INDEX "EmailVerificationToken_createdAt_idx";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "countryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "tenantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "activeCompanyId" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "revokedReason" TEXT,
ADD COLUMN     "tokenFamily" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "practiceTier" "PracticeTier" DEFAULT 'BEGINNER',
ADD COLUMN     "practiceXp" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE "AccountantActivity";

-- DropTable
DROP TABLE "AccountantClient";

-- DropEnum
DROP TYPE "PhilippinePayrollDeductionType";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "OnboardingData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '{}',
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeUnlockedTool" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tool" "PracticePremiumTool" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedVia" "ToolUnlockMethod" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,

    CONSTRAINT "PracticeUnlockedTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeXpLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "xpAmount" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,

    CONSTRAINT "PracticeXpLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeCertification" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "CertificationLevel" NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "companyId" TEXT,

    CONSTRAINT "PracticeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingData_userId_key" ON "OnboardingData"("userId");

-- CreateIndex
CREATE INDEX "PracticeUnlockedTool_workspaceId_idx" ON "PracticeUnlockedTool"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeUnlockedTool_workspaceId_tool_key" ON "PracticeUnlockedTool"("workspaceId", "tool");

-- CreateIndex
CREATE INDEX "PracticeXpLog_workspaceId_idx" ON "PracticeXpLog"("workspaceId");

-- CreateIndex
CREATE INDEX "PracticeXpLog_userId_idx" ON "PracticeXpLog"("userId");

-- CreateIndex
CREATE INDEX "PracticeCertification_workspaceId_idx" ON "PracticeCertification"("workspaceId");

-- CreateIndex
CREATE INDEX "PracticeCertification_userId_idx" ON "PracticeCertification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeCertification_userId_level_key" ON "PracticeCertification"("userId", "level");

-- CreateIndex
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE INDEX "Session_tokenFamily_idx" ON "Session"("tokenFamily");

-- CreateIndex
CREATE INDEX "Session_userId_revoked_idx" ON "Session"("userId", "revoked");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_activeCompanyId_fkey" FOREIGN KEY ("activeCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUnlockedTool" ADD CONSTRAINT "PracticeUnlockedTool_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeUnlockedTool" ADD CONSTRAINT "PracticeUnlockedTool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

