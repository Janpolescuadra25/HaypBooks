-- Migration: Add optional normalSide to Account and update account_normal_balance_violations view
-- Run on Postgres in a maintenance window.

ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "normalSide" TEXT;

-- No backfill by default; this allows manual overrides. If you want to propagate defaults, run:
-- UPDATE "Account" a SET "normalSide" = at."normalSide"
-- FROM "AccountType" at WHERE a."typeId" = at.id AND a."normalSide" IS NULL;

-- Recreate the view to respect account-level overrides
DROP VIEW IF EXISTS account_normal_balance_violations;

CREATE OR REPLACE VIEW account_normal_balance_violations AS
SELECT a.id AS "accountId",
       a.code,
       a.name,
       COALESCE(a."normalSide", at."normalSide") AS "effectiveNormalSide",
       a.balance
FROM "Account" a
JOIN "AccountType" at ON a."typeId" = at.id
WHERE (COALESCE(a."normalSide", at."normalSide") = 'DEBIT' AND a.balance < 0)
   OR (COALESCE(a."normalSide", at."normalSide") = 'CREDIT' AND a.balance > 0);

-- Helpful query for investigation
-- SELECT * FROM account_normal_balance_violations LIMIT 100;
