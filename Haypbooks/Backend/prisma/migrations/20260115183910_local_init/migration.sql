/*
  Warnings:

  - You are about to drop the column `firmName` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `name` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('OWNER', 'ACCOUNTANT');

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_subscriptionId_fkey";

-- DropIndex
DROP INDEX "Tenant_username_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "legalName" VARCHAR(200),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "firmName",
DROP COLUMN "username",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "TenantType" NOT NULL DEFAULT 'OWNER',
ALTER COLUMN "trialEndsAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firmname" TEXT;

-- DropEnum
DROP TYPE "AccountantAccessLevel";

-- DropEnum
DROP TYPE "UserType";

-- DropEnum
DROP TYPE "preferred_hub";

-- DropEnum
DROP TYPE "subscription_plan";

-- DropEnum
DROP TYPE "subscription_status";

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "data" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
