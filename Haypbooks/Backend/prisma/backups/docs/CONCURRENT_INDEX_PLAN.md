Production-safe CONCURRENT index plan (Postgres)

Goal: add large GIN/full-text and partial indexes with minimal locking.

1) Maintenance window requirements
- Ensure autovacuum is healthy and replication lag is monitored.
- Run during off-peak hours.
- Use CREATE INDEX CONCURRENTLY to avoid long write locks.

2) Candidate indexes to build concurrently

-- Full-text indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_displayname_gin
ON "Customer" USING gin (to_tsvector('english', COALESCE("displayName", '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoiceline_description_gin
ON "InvoiceLine" USING gin (to_tsvector('english', COALESCE("description", '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journalentry_description_gin
ON "JournalEntry" USING gin (to_tsvector('english', COALESCE("description", '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journalentryline_description_gin
ON "JournalEntryLine" USING gin (to_tsvector('english', COALESCE("description", '')));

-- Partial indexes for active rows
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_company_status_due_not_deleted
ON "Invoice" ("companyId", "status", "dueDate") WHERE "deletedAt" IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paymentreceived_company_date_not_deleted
ON "PaymentReceived" ("companyId", "paymentDate") WHERE "deletedAt" IS NULL;

3) Validate
- Check pg_stat_progress_create_index for long-running operations.
- Verify index usage via EXPLAIN ANALYZE on the top queries.

4) Rollback
- If needed, DROP INDEX CONCURRENTLY idx_name;

Notes
- Do not run CREATE INDEX CONCURRENTLY inside a transaction block.
- If you need to backfill heavy tables, consider time-sliced builds (by companyId) for very large datasets.
