-- Migration: Payment Gateway Settlements and Payouts
-- Run on Postgres in a maintenance window.

CREATE TABLE IF NOT EXISTS "PaymentGatewaySettlement" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspaceId uuid NOT NULL,
  companyId uuid,
  gatewayName varchar(64) NOT NULL,
  externalId varchar(128),
  periodStart timestamptz NOT NULL,
  periodEnd timestamptz NOT NULL,
  grossAmount numeric(20,4) NOT NULL,
  feeAmount numeric(20,4) NOT NULL,
  netAmount numeric(20,4) NOT NULL,
  currency varchar(3),
  settledAt timestamptz,
  status varchar(32) NOT NULL DEFAULT 'PENDING',
  metadata jsonb,
  createdAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_pgs_workspace FOREIGN KEY (workspaceId) REFERENCES "Workspace" (id) ON DELETE CASCADE,
  CONSTRAINT fk_pgs_company FOREIGN KEY (companyId) REFERENCES "Company" (id) ON DELETE SET NULL
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pgs_workspace_company_gateway ON "PaymentGatewaySettlement" ("workspaceId", "companyId", "gatewayName");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pgs_company_period ON "PaymentGatewaySettlement" ("companyId", "periodStart", "periodEnd");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_pgs_gateway_externalid ON "PaymentGatewaySettlement" ("gatewayName", "externalId");

CREATE TABLE IF NOT EXISTS "PaymentGatewayPayout" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlementId uuid NOT NULL,
  payoutDate timestamptz NOT NULL,
  amount numeric(20,4) NOT NULL,
  externalPayoutId varchar(128),
  status varchar(32) NOT NULL DEFAULT 'PENDING',
  metadata jsonb,
  createdAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_payout_settlement FOREIGN KEY (settlementId) REFERENCES "PaymentGatewaySettlement" (id) ON DELETE CASCADE
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payout_settlementid ON "PaymentGatewayPayout" ("settlementId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payout_external ON "PaymentGatewayPayout" ("externalPayoutId");

-- Rollback:
-- DROP TABLE IF EXISTS "PaymentGatewayPayout";
-- DROP TABLE IF EXISTS "PaymentGatewaySettlement";