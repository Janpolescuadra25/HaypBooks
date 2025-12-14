/*
  Warnings:

  - The `purpose` column on the `Otp` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('RESET', 'VERIFY_EMAIL', 'MFA');

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "purpose",
ADD COLUMN     "purpose" "OtpPurpose" NOT NULL DEFAULT 'RESET';

-- CreateTable
CREATE TABLE "UserSecurityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSecurityEvent_userId_idx" ON "UserSecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "UserSecurityEvent_email_idx" ON "UserSecurityEvent"("email");

-- AddForeignKey
ALTER TABLE "UserSecurityEvent" ADD CONSTRAINT "UserSecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
