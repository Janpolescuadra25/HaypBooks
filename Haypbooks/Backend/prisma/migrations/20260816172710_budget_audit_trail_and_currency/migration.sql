-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "BudgetLine" DROP CONSTRAINT "BudgetLine_createdById_fkey";

-- DropForeignKey
ALTER TABLE "BudgetLine" DROP CONSTRAINT "BudgetLine_updatedById_fkey";

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BudgetLine" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Budget_createdById" RENAME TO "Budget_createdById_idx";

-- RenameIndex
ALTER INDEX "Budget_updatedById" RENAME TO "Budget_updatedById_idx";

-- RenameIndex
ALTER INDEX "BudgetLine_createdById" RENAME TO "BudgetLine_createdById_idx";

-- RenameIndex
ALTER INDEX "BudgetLine_updatedById" RENAME TO "BudgetLine_updatedById_idx";
