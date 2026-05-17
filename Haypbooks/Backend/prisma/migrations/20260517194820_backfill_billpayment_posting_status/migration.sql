-- AlterTable
ALTER TABLE "BillLine" ALTER COLUMN "rate" SET DATA TYPE DECIMAL(14,4),
ALTER COLUMN "discountPercent" SET DATA TYPE DECIMAL(14,4);

-- AlterTable
ALTER TABLE "BillPayment" ADD COLUMN     "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';

UPDATE "BillPayment" SET "postingStatus" = 'POSTED' WHERE "journalEntryId" IS NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceLine" ALTER COLUMN "discountPercent" SET DATA TYPE DECIMAL(14,4);
