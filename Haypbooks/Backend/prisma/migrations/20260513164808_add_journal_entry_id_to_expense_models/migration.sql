-- AlterTable
ALTER TABLE "ExpenseClaim" ADD COLUMN     "journalEntryId" TEXT,
ADD COLUMN     "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PerDiemClaim" ADD COLUMN     "journalEntryId" TEXT,
ADD COLUMN     "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "VendorCredit" ADD COLUMN     "journalEntryId" TEXT;

-- AlterTable
ALTER TABLE "mileage_logs" ADD COLUMN     "journalEntryId" TEXT,
ADD COLUMN     "postingStatus" "PostingStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerDiemClaim" ADD CONSTRAINT "PerDiemClaim_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCredit" ADD CONSTRAINT "VendorCredit_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
