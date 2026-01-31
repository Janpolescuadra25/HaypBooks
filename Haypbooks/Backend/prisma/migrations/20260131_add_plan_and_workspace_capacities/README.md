This migration adds plan & workspace capacity tables to support capacity-based features (Xero/org limits, API metering, file storage, etc.).

Capacity keys added (suggested):
- max_xero_orgs (number of connected Xero orgs permitted)
- max_bank_connections (connected bank feeds)
- max_invoice_templates (invoice templates per workspace)
- max_contacts (contact/customer records)
- max_api_calls_per_month (API call quota)
- file_storage_mb (file storage quota in MB)

Notes:
- The migration is additive and idempotent (CREATE TABLE IF NOT EXISTS).
- Plan.id was stored as text in some DB states; the implementation uses text plan_id references for compatibility. If you normalize Plan.id to uuid in the future, update the FK accordingly and add a careful migration.
- Use `scripts/set_default_plan_capacities.ts` to populate reasonable defaults (dry-run by default, `--apply` to insert).

Safety & rollout:
1. Take a staging backup. 2. Apply migration on staging. 3. Dry-run `scripts/set_default_plan_capacities.ts`, then run `--apply`. 4. Run full test-suite + RLS checks in CI. 5. Merge to main and deploy to production.
