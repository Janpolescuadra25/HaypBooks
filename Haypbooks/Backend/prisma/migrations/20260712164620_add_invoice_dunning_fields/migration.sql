-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billAddress" JSONB,
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "poNumber" TEXT,
ADD COLUMN     "recurringTemplateId" TEXT,
ADD COLUMN     "shipAddress" JSONB,
ADD COLUMN     "voidReason" TEXT,
ADD COLUMN     "voidedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Invoice_recurringTemplateId_idx" ON "Invoice"("recurringTemplateId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_recurringTemplateId_fkey" FOREIGN KEY ("recurringTemplateId") REFERENCES "RecurringInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
