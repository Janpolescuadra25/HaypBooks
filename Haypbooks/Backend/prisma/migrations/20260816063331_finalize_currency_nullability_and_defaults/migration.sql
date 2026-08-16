/*
  Warnings:

  - You are about to alter the column `exchangeRate` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,12)` to `Decimal(18,8)`.
  - You are about to alter the column `baseTotal` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - Made the column `currency` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exchangeRate` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `baseTotal` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.

*/
UPDATE "JournalEntry" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "JournalEntry" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;
UPDATE "JournalEntry" SET "baseTotal" = 0 WHERE "baseTotal" IS NULL;

-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "exchangeRate" SET NOT NULL,
ALTER COLUMN "exchangeRate" SET DEFAULT 1,
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "baseTotal" SET NOT NULL,
ALTER COLUMN "baseTotal" SET DEFAULT 0,
ALTER COLUMN "baseTotal" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "PerDiemClaim" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "payment_links" ALTER COLUMN "currency" SET DEFAULT 'USD';
