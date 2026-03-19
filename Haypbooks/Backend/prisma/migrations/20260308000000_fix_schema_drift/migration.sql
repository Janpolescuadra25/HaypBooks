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
ALTER TABLE "Company" DROP CONSTRAINT IF EXISTS "Company_countryId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "EmailVerificationToken_createdAt_idx";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "countryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "tenantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "activeCompanyId" TEXT,
ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
ADD COLUMN IF NOT EXISTS "revokedReason" TEXT,
ADD COLUMN IF NOT EXISTS "tokenFamily" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "practiceTier" "PracticeTier" DEFAULT 'BEGINNER',
ADD COLUMN IF NOT EXISTS "practiceXp" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE IF EXISTS "AccountantActivity";

-- DropTable
DROP TABLE IF EXISTS "AccountantClient";

-- DropEnum (idempotent via DO block)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PhilippinePayrollDeductionType') THEN DROP TYPE "PhilippinePayrollDeductionType"; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN DROP TYPE "UserType"; END IF; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "OnboardingData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '{}',
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PracticeUnlockedTool" (
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
CREATE TABLE IF NOT EXISTS "PracticeXpLog" (
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
CREATE TABLE IF NOT EXISTS "PracticeCertification" (
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

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "OnboardingData_userId_key" ON "OnboardingData"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeUnlockedTool_workspaceId_idx" ON "PracticeUnlockedTool"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeUnlockedTool_workspaceId_tool_key" ON "PracticeUnlockedTool"("workspaceId", "tool");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeXpLog_workspaceId_idx" ON "PracticeXpLog"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeXpLog_userId_idx" ON "PracticeXpLog"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeCertification_workspaceId_idx" ON "PracticeCertification"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeCertification_userId_idx" ON "PracticeCertification"("userId");
