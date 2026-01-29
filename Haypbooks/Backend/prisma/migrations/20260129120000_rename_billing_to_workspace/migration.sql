-- Migration: Rename TenantBilling* tables to WorkspaceBilling*
-- NOTE: This migration is a safe rename for existing data. Review and test on a staging DB before applying to production.

BEGIN;

-- Rename tables
ALTER TABLE "TenantBillingInvoice" RENAME TO "WorkspaceBillingInvoice";
ALTER TABLE "TenantBillingUsage" RENAME TO "WorkspaceBillingUsage";

-- Rename tenantId -> workspaceId columns
ALTER TABLE "WorkspaceBillingInvoice" RENAME COLUMN "tenantId" TO "workspaceId";
ALTER TABLE "WorkspaceBillingUsage" RENAME COLUMN "tenantId" TO "workspaceId";

-- Rename indexes
ALTER INDEX IF EXISTS "TenantBillingInvoice_invoiceNumber_key" RENAME TO "WorkspaceBillingInvoice_invoiceNumber_key";
ALTER INDEX IF EXISTS "TenantBillingInvoice_tenantId_status_idx" RENAME TO "WorkspaceBillingInvoice_workspaceId_status_idx";
ALTER INDEX IF EXISTS "TenantBillingUsage_tenantId_period_key" RENAME TO "WorkspaceBillingUsage_workspaceId_period_key";

-- If there are foreign keys referencing tenantId, we assume they reference Tenant/Workspace id type (uuid). If not, you'll need to drop/recreate FKs here.

COMMIT;
