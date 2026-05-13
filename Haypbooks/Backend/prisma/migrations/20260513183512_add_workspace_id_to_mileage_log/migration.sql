/*
  Warnings:

  - Added the required column `workspaceId` to the `mileage_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mileage_logs" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "mileage_logs_workspaceId_idx" ON "mileage_logs"("workspaceId");

-- AddForeignKey
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
