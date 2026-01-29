-- Migration: Create NotificationPreference table for per-scope notification preferences
-- Run on Postgres in a maintenance window

CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspaceId uuid,
  companyId uuid,
  userId uuid,
  channels jsonb NOT NULL DEFAULT '{}',
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_notificationpref_workspace FOREIGN KEY (workspaceId) REFERENCES "Workspace" (id) ON DELETE SET NULL,
  CONSTRAINT fk_notificationpref_company FOREIGN KEY (companyId) REFERENCES "Company" (id) ON DELETE SET NULL,
  CONSTRAINT fk_notificationpref_user FOREIGN KEY (userId) REFERENCES "User" (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notificationpref_scope ON "NotificationPreference" ("workspaceId", "companyId", "userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notificationpref_workspace ON "NotificationPreference" ("workspaceId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notificationpref_company ON "NotificationPreference" ("companyId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notificationpref_user ON "NotificationPreference" ("userId");

-- Rollback:
-- DROP TABLE IF EXISTS "NotificationPreference";
