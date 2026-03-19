/*
  Warnings:

  - Changed the type of `deductionType` on the `PhilippinePayrollDeduction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- RenameEnum
ALTER TYPE "PhilippinePayrollDeductionType" RENAME TO "PayrollDeductionType";

-- AlterTable
ALTER TABLE "PhilippineFinancialStatementTemplate" ADD COLUMN     "countryId" TEXT;

-- AlterTable
ALTER TABLE "PhilippinePayrollDeduction" ADD COLUMN     "countryId" TEXT;



-- AddForeignKey
ALTER TABLE "PhilippinePayrollDeduction" ADD CONSTRAINT "PhilippinePayrollDeduction_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhilippineFinancialStatementTemplate" ADD CONSTRAINT "PhilippineFinancialStatementTemplate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
