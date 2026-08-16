/*
  Warnings:

  - You are about to alter the column `exchangeRate` on the `BankDeposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,12)` to `Decimal(18,8)`.
  - You are about to alter the column `baseAmount` on the `BankDeposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - You are about to alter the column `exchangeRate` on the `PaymentReceived` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,12)` to `Decimal(18,8)`.
  - You are about to alter the column `baseAmount` on the `PaymentReceived` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(18,2)`.
  - Made the column `currency` on table `BankDeposit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exchangeRate` on table `BankDeposit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `baseAmount` on table `BankDeposit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `PaymentReceived` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exchangeRate` on table `PaymentReceived` required. This step will fail if there are existing NULL values in that column.
  - Made the column `baseAmount` on table `PaymentReceived` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill NULL values before making BankDeposit fields required
UPDATE "BankDeposit" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "BankDeposit" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;
UPDATE "BankDeposit" SET "baseAmount" = 0 WHERE "baseAmount" IS NULL;

-- AlterTable
ALTER TABLE "BankDeposit" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "exchangeRate" SET NOT NULL,
ALTER COLUMN "exchangeRate" SET DEFAULT 1,
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "baseAmount" SET NOT NULL,
ALTER COLUMN "baseAmount" SET DEFAULT 0,
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(18,2);

-- Backfill NULL values before making PaymentReceived fields required
UPDATE "PaymentReceived" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "PaymentReceived" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;
UPDATE "PaymentReceived" SET "baseAmount" = 0 WHERE "baseAmount" IS NULL;

-- AlterTable
ALTER TABLE "PaymentReceived" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "exchangeRate" SET NOT NULL,
ALTER COLUMN "exchangeRate" SET DEFAULT 1,
ALTER COLUMN "exchangeRate" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "baseAmount" SET NOT NULL,
ALTER COLUMN "baseAmount" SET DEFAULT 0,
ALTER COLUMN "baseAmount" SET DATA TYPE DECIMAL(18,2);
