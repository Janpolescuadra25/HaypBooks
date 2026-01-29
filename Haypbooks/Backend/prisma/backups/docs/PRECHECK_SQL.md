Pre-check SQL to locate violating rows

Run in staging before applying constraints.

1) XOR ownership checks

-- OnboardingStep: must have exactly one of companyId or practiceId
SELECT *
FROM "OnboardingStep"
WHERE ("companyId" IS NULL AND "practiceId" IS NULL)
   OR ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL);

-- Subscription: must have exactly one of companyId or practiceId
SELECT *
FROM "Subscription"
WHERE ("companyId" IS NULL AND "practiceId" IS NULL)
   OR ("companyId" IS NOT NULL AND "practiceId" IS NOT NULL);

-- Task: companyId and practiceId must not both be set
SELECT *
FROM "Task"
WHERE "companyId" IS NOT NULL AND "practiceId" IS NOT NULL;

-- RecurringSchedule: companyId and practiceId must not both be set
SELECT *
FROM "RecurringSchedule"
WHERE "companyId" IS NOT NULL AND "practiceId" IS NOT NULL;

2) Date ordering checks

-- FixedAssetSchedule: startDate <= endDate
SELECT *
FROM "FixedAssetSchedule"
WHERE "endDate" IS NOT NULL AND "startDate" > "endDate";

-- ConsolidationGroupMember: effectiveFrom <= effectiveTo
SELECT *
FROM "ConsolidationGroupMember"
WHERE "effectiveTo" IS NOT NULL AND "effectiveFrom" > "effectiveTo";

-- YearEndClose: startedAt <= completedAt
SELECT *
FROM "YearEndClose"
WHERE "startedAt" IS NOT NULL AND "completedAt" IS NOT NULL AND "startedAt" > "completedAt";

3) Non-negative / range checks

-- Invoice total and balance non-negative
SELECT *
FROM "Invoice"
WHERE "total" < 0 OR "balance" < 0;

-- PaymentReceived amount non-negative
SELECT *
FROM "PaymentReceived"
WHERE "amount" < 0;

-- JournalEntryLine debit/credit non-negative
SELECT *
FROM "JournalEntryLine"
WHERE "debit" < 0 OR "credit" < 0;

-- ExchangeRate rate positive
SELECT *
FROM "ExchangeRate"
WHERE "rate" <= 0;

4) Duplicate invoice numbers

SELECT "companyId", "invoiceNumber", count(*) AS cnt
FROM "Invoice"
WHERE "invoiceNumber" IS NOT NULL
GROUP BY "companyId", "invoiceNumber"
HAVING count(*) > 1;

Notes
- Fix any rows returned by these queries before applying constraints.
- For large tables, filter by companyId to triage and batch-fix data.
