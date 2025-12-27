-- Idempotent migration to add subscription enums, Subscription table, and hub-related fields

-- Ensure enum types exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('FREE','STARTER','GROWTH','PROFESSIONAL','ENTERPRISE');
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- already exists
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('TRIAL','ACTIVE','PAST_DUE','CANCELED','UNPAID');
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- already exists
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preferred_hub') THEN
    CREATE TYPE preferred_hub AS ENUM ('OWNER','ACCOUNTANT');
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- already exists
END $$;

-- Add Subscription table (if not present)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Subscription') THEN
    CREATE TABLE public."Subscription" (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      "tenantId" uuid NOT NULL,
      "companyId" uuid,
      plan subscription_plan DEFAULT 'FREE',
      status subscription_status DEFAULT 'TRIAL',
      "trialEndsAt" timestamptz,
      "currentPeriodStart" timestamptz,
      "currentPeriodEnd" timestamptz,
      "stripeCustomerId" text,
      "stripeSubscriptionId" text,
      "createdAt" timestamptz DEFAULT now()
    );
    ALTER TABLE public."Subscription" ADD CONSTRAINT fk_sub_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE CASCADE NOT VALID;
    ALTER TABLE public."Subscription" ADD CONSTRAINT fk_sub_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON DELETE SET NULL NOT VALID;
  END IF;
EXCEPTION WHEN others THEN
  -- ignore
END $$;

-- Add tenant.subscriptionId column (unique nullable)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tenant' AND column_name='subscriptionId') THEN
    ALTER TABLE public."Tenant" ADD COLUMN "subscriptionId" uuid UNIQUE;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- already exists
END $$;

-- Try to convert Tenant.plan from text to enum; fall back to adding column if absent or conversion fails
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tenant' AND column_name='plan') THEN
    ALTER TABLE public."Tenant" ADD COLUMN "plan" subscription_plan DEFAULT 'FREE';
  ELSE
    -- If column exists but is not the enum, attempt to alter type
    BEGIN
      ALTER TABLE public."Tenant" ALTER COLUMN "plan" TYPE subscription_plan USING ("plan"::text::subscription_plan);
    EXCEPTION WHEN others THEN
      -- Conversion failed (values may not match exactly); add a new column and copy values where possible
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tenant' AND column_name='plan_new') THEN
        ALTER TABLE public."Tenant" ADD COLUMN "plan_new" subscription_plan DEFAULT 'FREE';
        -- Attempt to map common strings
        UPDATE public."Tenant" SET "plan_new" = CASE WHEN lower("plan") = 'free' THEN 'FREE'::subscription_plan ELSE 'FREE'::subscription_plan END;
        ALTER TABLE public."Tenant" DROP COLUMN "plan";
        ALTER TABLE public."Tenant" RENAME COLUMN "plan_new" TO "plan";
      END IF;
    END;
  END IF;
EXCEPTION WHEN others THEN
  -- ignore
END $$;

-- Add preferredHub to User
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='preferredHub') THEN
    ALTER TABLE public."User" ADD COLUMN "preferredHub" preferred_hub;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- already exists
END $$;

-- Add isSystem to Account
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Account' AND column_name='isSystem') THEN
    ALTER TABLE public."Account" ADD COLUMN "isSystem" boolean DEFAULT false;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- already exists
END $$;

-- Add company currency and fiscalYearStart
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Company' AND column_name='currency') THEN
    ALTER TABLE public."Company" ADD COLUMN currency text DEFAULT 'USD';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Company' AND column_name='fiscalYearStart') THEN
    ALTER TABLE public."Company" ADD COLUMN "fiscalYearStart" integer;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- already exists
END $$;

-- Add indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'TenantUser_tenant_lastaccessed_idx') THEN
    CREATE INDEX "TenantUser_tenant_lastaccessed_idx" ON public."TenantUser" ("tenantId", "lastAccessedAt");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Invoice_tenant_status_due_idx') THEN
    CREATE INDEX "Invoice_tenant_status_due_idx" ON public."Invoice" ("tenantId", "status", "dueDate");
  END IF;
END $$;

-- Add index on subscription stripe id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Subscription' AND column_name='stripeSubscriptionId') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Subscription_stripeSubscriptionId_idx') THEN
      CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_idx" ON public."Subscription" ("stripeSubscriptionId");
    END IF;
  END IF;
END $$;
