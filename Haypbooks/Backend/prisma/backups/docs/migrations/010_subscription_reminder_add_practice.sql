-- Migration: Add practiceId foreign key to SubscriptionReminder for practice-scoped reminders
-- Run on Postgres in a maintenance window.

ALTER TABLE "SubscriptionReminder" ADD COLUMN IF NOT EXISTS "practiceId" uuid;

ALTER TABLE "SubscriptionReminder"
  ADD CONSTRAINT IF NOT EXISTS fk_subscriptionreminder_practice FOREIGN KEY ("practiceId") REFERENCES "Practice" (id) ON DELETE SET NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptionreminder_practice_remindat ON "SubscriptionReminder" ("practiceId", "remindAt");

-- Rollback:
-- ALTER TABLE "SubscriptionReminder" DROP CONSTRAINT IF EXISTS fk_subscriptionreminder_practice;
-- ALTER TABLE "SubscriptionReminder" DROP COLUMN IF EXISTS "practiceId";
-- DROP INDEX CONCURRENTLY IF EXISTS idx_subscriptionreminder_practice_remindat;
