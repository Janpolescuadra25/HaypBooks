#!/usr/bin/env node
const { Client } = require('pg')

;(async () => {
  if (typeof process.env.DATABASE_URL !== 'string') {
    console.error('DATABASE_URL is not a string:', typeof process.env.DATABASE_URL)
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL, 'length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)
    process.exit(1)
  }
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await c.connect()
    console.log('Ensuring test RLS and accountant tables...')
    function q(sql) { console.log('SQL ->', sql.replace(/\s+/g, ' ').slice(0, 300)); return c.query(sql) }

    // Create UserType enum if missing
    await q(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN CREATE TYPE "UserType" AS ENUM ('STANDARD','ACCOUNTANT'); END IF; END$$;`)
    // Create tables if missing
    await q(`CREATE TABLE IF NOT EXISTS public."AccountantClient" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "accountantId" text NOT NULL,
      "tenantId" text NOT NULL,
      "accessLevel" text NOT NULL DEFAULT 'FULL',
      "invitedBy" text,
      "invitedAt" timestamptz,
      "acceptedAt" timestamptz,
      "status" text NOT NULL DEFAULT 'ACTIVE'
    );`)
    await q(`CREATE TABLE IF NOT EXISTS public."AccountantActivity" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "accountantId" text NOT NULL,
      "tenantId" text,
      "action" text NOT NULL,
      "details" jsonb,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );`)

    // Add policies if missing
    await q(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantClient' AND p.polname = 'rls_tenant') THEN EXECUTE $p$ CREATE POLICY rls_tenant ON public."AccountantClient" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true)); $p$; END IF; END$$;`)
    await q(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantActivity' AND p.polname = 'rls_tenant') THEN EXECUTE $p$ CREATE POLICY rls_tenant ON public."AccountantActivity" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR "tenantId" = current_setting('haypbooks.tenant_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR "tenantId" = current_setting('haypbooks.tenant_id', true)); $p$; END IF; END$$;`)

    // Add RLS policy for core accounting tables (prevents cross-company access even if the app query is wrong)
    await q(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Account') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'Account' AND p.polname = 'rls_company') THEN
          EXECUTE $p$ CREATE POLICY rls_company ON public."Account" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true)); $p$;
        END IF;
      END IF; END$$;`)

    await q(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='JournalEntry') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'JournalEntry' AND p.polname = 'rls_company') THEN
          EXECUTE $p$ CREATE POLICY rls_company ON public."JournalEntry" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true)); $p$;
        END IF;
      END IF; END$$;`)

    // Add workspace-level RLS on Task (for isolation in tests and real workloads)
    await q(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Task') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'Task' AND p.polname = 'rls_workspace') THEN
          EXECUTE $p$ CREATE POLICY rls_workspace ON public."Task" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("workspaceId")::text = current_setting('haypbooks.workspace_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("workspaceId")::text = current_setting('haypbooks.workspace_id', true)); $p$;
        END IF;
      END IF; END$$;`)

    // Create indexes and unique constraint
    await q(`CREATE UNIQUE INDEX IF NOT EXISTS "AccountantClient_accountant_tenant_uq" ON public."AccountantClient" ("accountantId", "tenantId")`)
    await q(`CREATE INDEX IF NOT EXISTS "AccountantClient_tenantId_idx" ON public."AccountantClient" ("tenantId")`)
    await q(`CREATE INDEX IF NOT EXISTS "AccountantClient_accountantId_idx" ON public."AccountantClient" ("accountantId")`)
    await q(`CREATE INDEX IF NOT EXISTS "AccountantActivity_accountant_created_idx" ON public."AccountantActivity" ("accountantId", "createdAt")`)
    await q(`CREATE INDEX IF NOT EXISTS "AccountantActivity_tenantId_idx" ON public."AccountantActivity" ("tenantId")`)

    // Enable RLS on tables (idempotent)
    await q(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='AccountantClient') THEN ALTER TABLE public."AccountantClient" ENABLE ROW LEVEL SECURITY; END IF; IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='AccountantActivity') THEN ALTER TABLE public."AccountantActivity" ENABLE ROW LEVEL SECURITY; END IF; END$$;`)
    console.log('RLS enabling script completed')
  } catch (err) {
    console.error('Error enabling test RLS:', err && err.message ? err.message : err)
    process.exit(1)
  } finally {
    await c.end()
  }
})()
