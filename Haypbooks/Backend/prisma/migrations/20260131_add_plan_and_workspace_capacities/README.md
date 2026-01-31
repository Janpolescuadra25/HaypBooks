This migration adds plan & workspace capacity tables to support capacity-based features (accounting provider / org limits, API metering, file storage, etc.).

Capacity keys added (suggested):

HaypBooks-branded numeric limits (preferred):
- max_companies (number of companies/workspaces a plan can create/connect)
- max_active_users (concurrent/active users; -1 = unlimited)
- max_invoices_per_month (monthly invoice emission quota; -1 = unlimited)
- max_bank_accounts (connected bank accounts/feeds)
- max_storage_gb (file/storage quota in GB)

Legacy/compatibility keys (kept for backward compatibility):
- max_accounting_orgs (alias for max_companies)
- max_bank_connections (alias for max_bank_accounts)
- max_invoice_templates (legacy invoice template quota)
- max_contacts (contact/customer records)
- max_api_calls_per_month (API call quota)
- file_storage_mb (legacy file storage in MB)

Notes:
- The migration is additive and idempotent (CREATE TABLE IF NOT EXISTS).
- Plan.id was stored as text in some DB states; the implementation uses text plan_id references for compatibility. If you normalize Plan.id to uuid in the future, update the FK accordingly and add a careful migration.
- Use `scripts/set_default_plan_capacities.ts` to populate reasonable defaults (dry-run by default, `--apply` to insert).

Safety & rollout:
1. Take a staging backup. 2. Apply migration on staging. 3. Dry-run `scripts/set_default_plan_capacities.ts`, then run `--apply`. 4. Run full test-suite + RLS checks in CI. 5. Merge to main and deploy to production.
