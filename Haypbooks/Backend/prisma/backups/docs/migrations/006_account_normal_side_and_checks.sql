-- Migration: Add normalSide to AccountType and create a view to flag balance sign violations
-- Run in Postgres in a maintenance window.

-- 1) Add column
ALTER TABLE "AccountType" ADD COLUMN IF NOT EXISTS "normalSide" TEXT;

-- 2) Populate default values based on category mapping
-- Mapping suggestion:
-- ASSET, EXPENSE, CONTRA_REVENUE => DEBIT
-- LIABILITY, EQUITY, REVENUE, CONTRA_ASSET, CONTRA_EXPENSE, TEMPORARY_EQUITY => CREDIT
UPDATE "AccountType"
SET "normalSide" = CASE
  WHEN "category" IN ('ASSET', 'EXPENSE', 'CONTRA_REVENUE') THEN 'DEBIT'
  ELSE 'CREDIT'
END
WHERE "normalSide" IS NULL;

-- 3) Make not null and add check constraint for allowed values
ALTER TABLE "AccountType" ALTER COLUMN "normalSide" SET NOT NULL;
ALTER TABLE "AccountType" ADD CONSTRAINT IF NOT EXISTS accounttype_normal_side_check CHECK ("normalSide" IN ('DEBIT','CREDIT'));

-- 4) Create a view listing accounts whose balances are opposite their normal side
CREATE OR REPLACE VIEW account_normal_balance_violations AS
SELECT a.id AS "accountId",
       a.code,
       a.name,
       at."normalSide",
       a.balance
FROM "Account" a
JOIN "AccountType" at ON a."typeId" = at.id
WHERE (at."normalSide" = 'DEBIT' AND a.balance < 0)
   OR (at."normalSide" = 'CREDIT' AND a.balance > 0);

-- Helpful query for investigation
-- SELECT * FROM account_normal_balance_violations LIMIT 100;
