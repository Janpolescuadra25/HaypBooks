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
  "tenantId" text NOT NULL,
  "companyId" text NULL,
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
-- Add FK constraints only if they do not already exist (Postgres doesn't support ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
  -- Add tenant FK only if Tenant.id and Task.tenantId have the same data type
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_tenant') AND
     EXISTS (SELECT 1 FROM information_schema.columns t1 JOIN information_schema.columns t2 ON t1.data_type = t2.data_type WHERE t1.table_schema='public' AND t1.table_name='tenant' AND t1.column_name='id' AND t2.table_schema='public' AND t2.table_name='Task' AND t2.column_name='tenantId') THEN
    EXECUTE 'ALTER TABLE public."Task" ADD CONSTRAINT fk_task_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT';
  END IF;
  -- Add company FK only if Company.id and Task.companyId have the same data type
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_company') AND
     EXISTS (SELECT 1 FROM information_schema.columns c1 JOIN information_schema.columns c2 ON c1.data_type = c2.data_type WHERE c1.table_schema='public' AND c1.table_name='Company' AND c1.column_name='id' AND c2.table_schema='public' AND c2.table_name='Task' AND c2.column_name='companyId') THEN
    EXECUTE 'ALTER TABLE public."Task" ADD CONSTRAINT fk_task_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_creator') THEN
    EXECUTE 'ALTER TABLE public."Task" ADD CONSTRAINT fk_task_creator FOREIGN KEY ("createdById") REFERENCES public."User"("id") ON DELETE CASCADE';
  END IF;
  -- Composite FK to TenantUser (tenantId, assigneeId) -> (tenantId, userId)
  -- Only add if both pair of columns exist and their data types match
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_assignee') AND
     EXISTS (SELECT 1 FROM information_schema.columns c1 JOIN information_schema.columns c2 ON c1.data_type = c2.data_type WHERE c1.table_schema='public' AND c1.table_name='TenantUser' AND c1.column_name='tenantId' AND c2.table_schema='public' AND c2.table_name='Task' AND c2.column_name='tenantId') AND
     EXISTS (SELECT 1 FROM information_schema.columns c3 JOIN information_schema.columns c4 ON c3.data_type = c4.data_type WHERE c3.table_schema='public' AND c3.table_name='TenantUser' AND c3.column_name='userId' AND c4.table_schema='public' AND c4.table_name='Task' AND c4.column_name='assigneeId') THEN
    EXECUTE 'ALTER TABLE public."Task" ADD CONSTRAINT fk_task_assignee FOREIGN KEY ("tenantId", "assigneeId") REFERENCES public."TenantUser"("tenantId", "userId") ON DELETE SET NULL';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comment_task') THEN
    EXECUTE 'ALTER TABLE public."TaskComment" ADD CONSTRAINT fk_comment_task FOREIGN KEY ("taskId") REFERENCES public."Task"("id") ON DELETE CASCADE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comment_user') THEN
    EXECUTE 'ALTER TABLE public."TaskComment" ADD CONSTRAINT fk_comment_user FOREIGN KEY ("userId") REFERENCES public."User"("id") ON DELETE CASCADE';
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_tenant_status ON public."Task" ("tenantId", "status");
CREATE INDEX IF NOT EXISTS idx_task_tenant_assignee ON public."Task" ("tenantId", "assigneeId");
CREATE INDEX IF NOT EXISTS idx_task_tenant_duedate ON public."Task" ("tenantId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_task_tenant_priority ON public."Task" ("tenantId", "priority");
CREATE INDEX IF NOT EXISTS idx_task_remindat ON public."Task" ("remindAt");
