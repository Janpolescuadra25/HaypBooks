-- Remove subscriptionId from Tenant table since subscriptions are per-Company, not per-Tenant
-- Each Company has its own subscription via Company.subscriptionId
-- Tenant keeps trial fields (trialEndsAt, trialUsed) for firm-wide trial

ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "subscriptionId";
