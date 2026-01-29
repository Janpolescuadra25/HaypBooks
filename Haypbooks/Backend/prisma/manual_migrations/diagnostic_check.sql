-- Diagnostic checks for newly added schema artifacts
-- 1) Migration history
SELECT count(*) AS total_migrations, count(*) FILTER (WHERE finished_at IS NULL) AS pending_migrations FROM _prisma_migrations;
SELECT migration_name, finished_at, logs FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 20;

-- 2) Table existence
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('JournalEntry','ReconciliationException','SubledgerReconciliation','Estimate');

-- 3) Columns presence for JournalEntry and ReconciliationException
SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('JournalEntry','ReconciliationException') AND column_name IN ('reviewedById','reviewedAt','approvedById','approvedAt','reviewNotes','approvalNotes','subledgerReconciliationId');

-- 4) Enum types and their values
SELECT t.typname AS enum_type, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid WHERE t.typname IN ('postingstatus','subledgertype','reconciliationstatus','estimatetype','estimatestatus') GROUP BY t.typname;

-- 5) Foreign key constraints we expect
SELECT conname, conrelid::regclass AS table_from, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname IN ('SubledgerReconciliation_company_fkey','Estimate_company_fkey','ReconciliationException_subledger_recon_fkey','JournalEntry_reviewedBy_fkey','JournalEntry_approvedBy_fkey');

-- 6) Index checks
SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('SubledgerReconciliation','Estimate','JournalEntry','ReconciliationException') ORDER BY tablename, indexname;

-- 7) Row sanity (sample counts)
SELECT 'SubledgerReconciliation' AS t, count(*) FROM public."SubledgerReconciliation";
SELECT 'Estimate' AS t, count(*) FROM public."Estimate";
SELECT 'JournalEntry_newcols' AS t, count(*) FROM public."JournalEntry" WHERE "reviewedById" IS NOT NULL OR "approvedById" IS NOT NULL;
