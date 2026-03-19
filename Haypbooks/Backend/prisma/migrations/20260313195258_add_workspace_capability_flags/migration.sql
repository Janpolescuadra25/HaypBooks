/*
  Warnings:

  - Added the required column `updatedAt` to the `WorkspaceCapabilities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceCapabilities" ADD COLUMN     "accountingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "apEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "arEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bankingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "integrationsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inventoryEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payrollEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "taxEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timeTrackingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
