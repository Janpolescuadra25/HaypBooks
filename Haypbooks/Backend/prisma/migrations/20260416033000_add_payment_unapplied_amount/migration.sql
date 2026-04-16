-- AlterTable
ALTER TABLE "PaymentReceived"
ADD COLUMN IF NOT EXISTS "unappliedAmount" DECIMAL(19,4) NOT NULL DEFAULT 0;

-- Backfill unapplied amounts from existing payment allocations.
UPDATE "PaymentReceived" pr
SET "unappliedAmount" = GREATEST(
  0,
  COALESCE(pr."amount", 0) - COALESCE((
    SELECT SUM(ipa."amount")
    FROM "InvoicePaymentApplication" ipa
    WHERE ipa."paymentId" = pr."id"
  ), 0)
);
