Migration plan (high level)

1) Pre-checks in staging
   - Run the duplicate invoice-number check in SQL to find and resolve any duplicates:
     SELECT "companyId", "invoiceNumber", count(*) cnt FROM "Invoice" WHERE "invoiceNumber" IS NOT NULL GROUP BY "companyId", "invoiceNumber" HAVING count(*) > 1;
   - Run the provided db_constraints.sql in a transaction on staging to identify violations.

2) Apply migrations
   - Run `docs/migrations/001_document_sequence_and_constraints.sql` in staging (psql or migration runner).
   - Apply db constraints from `docs/db_constraints.sql` (same migration batch if possible).
   - Run Prisma migrate (or your migration tool) to apply `schema.prisma` changes (enum and @@unique additions).

3) Application changes
   - Use `public.next_document_number(companyId::uuid, 'INVOICE')` inside a transaction to reserve a number for an invoice. Wrap number assignment and invoice creation in the same transaction to avoid races.
   - Add test coverage for concurrent invoice creation (stress test with multiple workers).

4) Post-migration
   - Monitor errors and duplicate attempts for a few days.
   - Prune redundant indexes discovered via slow query logs and optimize partial indexes for common queries (e.g., `WHERE deletedAt IS NULL`).

5) Additional integrity & search optimizations
   - Run `docs/migrations/002_constraints_and_indexes.sql` to add ownership XOR constraints, date ordering checks, non-negative checks, and full-text + partial indexes.
   - Review the migration output for RAISE EXCEPTION messages (these indicate data violations that must be fixed). For large tables, create GIN indexes using `CONCURRENTLY` as part of a maintenance window to avoid long locks.

Notes
- If you use a migration runner that doesn't support psql meta commands (\i), place the contents of `docs/db_constraints.sql` inline or use your runner's include mechanism.
- Consider adding a small application-level retry loop around sequence assignment for transient failures (the function is resilient but app must handle DB errors gracefully).