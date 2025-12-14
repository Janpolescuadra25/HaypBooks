-- 20251214131500_add_tasks/migration.sql
-- Add Task and TaskComment tables and enums

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskstatus') THEN
    CREATE TYPE taskstatus AS ENUM ('PENDING','IN_PROGRESS','DONE','BLOCKED','CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskpriority') THEN
    CREATE TYPE taskpriority AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
  END IF;
END$$;

-- Tasks table
CREATE TABLE IF NOT EXISTS public."Task" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "companyId" uuid NULL,
  "title" text NOT NULL,
  "description" text NULL,
  "status" taskstatus NOT NULL DEFAULT 'PENDING',
  "priority" taskpriority NOT NULL DEFAULT 'MEDIUM',
  "dueDate" timestamptz NULL,
  "remindAt" timestamptz NULL,
  "reminderSent" boolean NOT NULL DEFAULT false,
  "assigneeId" text NULL,
  "createdById" text NOT NULL,
  "relatedType" text NULL,
  "relatedId" text NULL,
  "completedAt" timestamptz NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public."TaskComment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "taskId" uuid NOT NULL,
  "userId" text NOT NULL,
  "comment" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Foreign keys
ALTER TABLE public."Task" ADD CONSTRAINT IF NOT EXISTS fk_task_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT;
ALTER TABLE public."Task" ADD CONSTRAINT IF NOT EXISTS fk_task_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL;
ALTER TABLE public."Task" ADD CONSTRAINT IF NOT EXISTS fk_task_creator FOREIGN KEY ("createdById") REFERENCES public."User"("id") ON DELETE CASCADE;
-- Composite FK to TenantUser (tenantId, assigneeId) -> (tenantId, userId)
ALTER TABLE public."Task" ADD CONSTRAINT IF NOT EXISTS fk_task_assignee FOREIGN KEY ("tenantId", "assigneeId") REFERENCES public."TenantUser"("tenantId", "userId") ON DELETE SET NULL;

ALTER TABLE public."TaskComment" ADD CONSTRAINT IF NOT EXISTS fk_comment_task FOREIGN KEY ("taskId") REFERENCES public."Task"("id") ON DELETE CASCADE;
ALTER TABLE public."TaskComment" ADD CONSTRAINT IF NOT EXISTS fk_comment_user FOREIGN KEY ("userId") REFERENCES public."User"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_tenant_status ON public."Task" ("tenantId", "status");
CREATE INDEX IF NOT EXISTS idx_task_tenant_assignee ON public."Task" ("tenantId", "assigneeId");
CREATE INDEX IF NOT EXISTS idx_task_tenant_duedate ON public."Task" ("tenantId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_task_tenant_priority ON public."Task" ("tenantId", "priority");
CREATE INDEX IF NOT EXISTS idx_task_remindat ON public."Task" ("remindAt");
