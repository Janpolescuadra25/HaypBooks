Row-Level Security (RLS) policy templates

These templates assume a multi-tenant model where every row is scoped by workspaceId or companyId.
Use a session parameter like app.current_workspace_id and app.current_company_id.

1) Enable RLS

ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntryLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentReceived" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vendor" ENABLE ROW LEVEL SECURITY;

2) Workspace-scoped tables (use workspaceId / tenantId)

-- Set the session variable at connection time:
-- SET app.current_workspace_id = '...';

CREATE POLICY workspace_isolation ON "Workspace"
USING ("id"::text = current_setting('app.current_workspace_id', true));

CREATE POLICY workspaceuser_isolation ON "WorkspaceUser"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

CREATE POLICY task_workspace_isolation ON "Task"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

CREATE POLICY auditlog_workspace_isolation ON "AuditLog"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

3) Company-scoped tables (use companyId)

-- Set the session variable at connection time:
-- SET app.current_company_id = '...';

CREATE POLICY company_isolation ON "Company"
USING ("id"::text = current_setting('app.current_company_id', true));

CREATE POLICY invoice_company_isolation ON "Invoice"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY bill_company_isolation ON "Bill"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY journalentry_company_isolation ON "JournalEntry"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY journalentryline_company_isolation ON "JournalEntryLine"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY paymentreceived_company_isolation ON "PaymentReceived"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY billpayment_company_isolation ON "BillPayment"
USING ("companyId"::text = current_setting('app.current_company_id', true));

CREATE POLICY customer_company_isolation ON "Customer"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

CREATE POLICY vendor_company_isolation ON "Vendor"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

4) Optional: allow workspace admins to see all companies in their workspace

-- Example: allow if current_workspace_id matches row workspaceId
-- (Requires company table to expose workspaceId; adjust if you use tenantId mapping)
CREATE POLICY company_workspace_admin ON "Company"
USING ("tenantId"::text = current_setting('app.current_workspace_id', true));

Notes
- Apply RLS to all multi-tenant tables.
- Enforce current_setting(...) with your DB connection pool (set per request).
- Use separate policies for read vs write if you need stricter controls.
