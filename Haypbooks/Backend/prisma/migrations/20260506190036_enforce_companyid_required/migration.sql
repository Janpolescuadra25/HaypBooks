/*
  Warnings:

  - Made the column `companyId` on table `BillPayment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `CustomerCredit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `CustomerCreditLine` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `VendorCreditLine` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `VendorPaymentMethod` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BillPayment" DROP CONSTRAINT "BillPayment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerCredit" DROP CONSTRAINT "CustomerCredit_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerCreditLine" DROP CONSTRAINT "CustomerCreditLine_companyId_fkey";

-- DropForeignKey
ALTER TABLE "VendorCreditLine" DROP CONSTRAINT "VendorCreditLine_companyId_fkey";

-- DropForeignKey
ALTER TABLE "VendorPaymentMethod" DROP CONSTRAINT "VendorPaymentMethod_companyId_fkey";

-- AlterTable
ALTER TABLE "BillPayment" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomerCredit" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomerCreditLine" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VendorCreditLine" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VendorPaymentMethod" ALTER COLUMN "companyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCreditLine" ADD CONSTRAINT "CustomerCreditLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCreditLine" ADD CONSTRAINT "VendorCreditLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentMethod" ADD CONSTRAINT "VendorPaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
