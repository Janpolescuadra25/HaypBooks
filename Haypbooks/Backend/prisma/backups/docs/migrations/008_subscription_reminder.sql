-- Migration: Create SubscriptionReminder table and indexes
-- Run on Postgres in a maintenance window

CREATE TABLE IF NOT EXISTS "SubscriptionReminder" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspaceId uuid NOT NULL,
  companyId uuid NOT NULL,
  subscriptionId uuid NOT NULL,
  remindAt timestamptz NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'PENDING',
  attempts int NOT NULL DEFAULT 0,
  sentAt timestamptz,
  "errorMessage" text,
  createdAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_subscriptionreminder_workspace FOREIGN KEY (workspaceId) REFERENCES "Workspace" (id) ON DELETE CASCADE,
  CONSTRAINT fk_subscriptionreminder_company FOREIGN KEY (companyId) REFERENCES "Company" (id) ON DELETE RESTRICT,
  CONSTRAINT fk_subscriptionreminder_subscription FOREIGN KEY (subscriptionId) REFERENCES "Subscription" (id) ON DELETE CASCADE
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptionreminder_workspace_remindat ON "SubscriptionReminder" ("workspaceId", "remindAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptionreminder_company_remindat ON "SubscriptionReminder" ("companyId", "remindAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptionreminder_subscription_remindat ON "SubscriptionReminder" ("subscriptionId", "remindAt");

-- Rollback:
-- DROP TABLE IF EXISTS "SubscriptionReminder";
