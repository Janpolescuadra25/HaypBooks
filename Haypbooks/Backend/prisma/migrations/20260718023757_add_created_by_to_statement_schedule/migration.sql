/*
  Warnings:

  - Added the required column `createdBy` to the `StatementSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatementSchedule" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StatementSchedule" ADD CONSTRAINT "StatementSchedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
