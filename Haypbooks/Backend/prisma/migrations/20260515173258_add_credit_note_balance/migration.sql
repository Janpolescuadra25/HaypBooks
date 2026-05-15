/*
  Warnings:

  - Added the required column `balance` to the `CreditNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CreditNoteStatus" ADD VALUE 'PARTIALLY_APPLIED';

-- AlterTable
ALTER TABLE "CreditNote" ADD COLUMN     "balance" DECIMAL(19,4) NOT NULL;

-- CreateTable
CREATE TABLE "CreditNoteApplication" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "creditNoteId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNoteApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditNoteApplication_workspaceId_idx" ON "CreditNoteApplication"("workspaceId");

-- CreateIndex
CREATE INDEX "CreditNoteApplication_creditNoteId_idx" ON "CreditNoteApplication"("creditNoteId");

-- CreateIndex
CREATE INDEX "CreditNoteApplication_invoiceId_idx" ON "CreditNoteApplication"("invoiceId");

-- AddForeignKey
ALTER TABLE "CreditNoteApplication" ADD CONSTRAINT "CreditNoteApplication_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "CreditNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
