/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AdminActionStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('SUSPEND_WORKSPACE', 'ACTIVATE_WORKSPACE', 'UPDATE_PLAN', 'RESET_USER_PASSWORD', 'GRANT_ADMIN_ACCESS', 'REVOKE_ADMIN_ACCESS', 'MODIFY_BILLING', 'EXPORT_DATA', 'DELETE_DATA', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminEntityType" AS ENUM ('WORKSPACE', 'USER', 'COMPANY', 'PRACTICE', 'SUBSCRIPTION', 'BILLING_RECORD', 'SYSTEM_CONFIG');

-- CreateEnum
CREATE TYPE "PlatformMetricCategory" AS ENUM ('USER_GROWTH', 'REVENUE', 'SYSTEM_PERFORMANCE', 'COMPLIANCE', 'ENGAGEMENT');

-- CreateEnum
CREATE TYPE "AdminNotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AdminNotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "SystemRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "superAdminUserId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "entityType" "AdminEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "AdminActionStatus" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMetricSnapshot" (
    "id" TEXT NOT NULL,
    "category" "PlatformMetricCategory" NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DECIMAL(19,4) NOT NULL,
    "dimensions" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "AdminNotificationPriority" NOT NULL DEFAULT 'LOW',
    "status" "AdminNotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "assignedToId" TEXT,
    "isSystemAlert" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_superAdminUserId_idx" ON "AdminAuditLog"("superAdminUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformMetricSnapshot_category_metricName_idx" ON "PlatformMetricSnapshot"("category", "metricName");

-- CreateIndex
CREATE INDEX "PlatformMetricSnapshot_recordedAt_idx" ON "PlatformMetricSnapshot"("recordedAt");

-- CreateIndex
CREATE INDEX "AdminNotification_status_priority_idx" ON "AdminNotification"("status", "priority");

-- CreateIndex
CREATE INDEX "AdminNotification_assignedToId_idx" ON "AdminNotification"("assignedToId");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_superAdminUserId_fkey" FOREIGN KEY ("superAdminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
