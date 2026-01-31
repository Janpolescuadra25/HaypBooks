-- Add firm billing, feature flags, and onboarding progress (additive and idempotent)

BEGIN;

-- FirmPlan
CREATE TABLE IF NOT EXISTS "FirmPlan" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FirmPlanFeature
CREATE TABLE IF NOT EXISTS "FirmPlanFeature" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES "FirmPlan"(id) ON DELETE CASCADE,
  feature text NOT NULL,
  value text
);

-- FirmFeatureFlag
CREATE TABLE IF NOT EXISTS "FirmFeatureFlag" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES "Workspace"(id)
);
CREATE INDEX IF NOT EXISTS "idx_firm_feature_flag_workspace_name" ON "FirmFeatureFlag" (workspace_id, name);

-- FirmBillingInvoice
CREATE TABLE IF NOT EXISTS "FirmBillingInvoice" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES "Workspace"(id),
  invoice_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'PENDING',
  amount_cents integer NOT NULL DEFAULT 0,
  issued_at timestamptz NOT NULL DEFAULT now()
);

-- FirmOnboardingProgress
CREATE TABLE IF NOT EXISTS "FirmOnboardingProgress" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES "Workspace"(id) UNIQUE,
  step integer NOT NULL DEFAULT 0,
  meta jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
