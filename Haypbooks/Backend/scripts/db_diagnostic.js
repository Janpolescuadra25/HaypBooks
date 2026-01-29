const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  try {
    console.log('\n1) Migration table summary:')
    const migrations = await prisma.$queryRaw`SELECT count(*) AS total_migrations, count(*) FILTER (WHERE finished_at IS NULL) AS pending_migrations FROM _prisma_migrations`;
    console.log(migrations)

    console.log('\nRecent migrations:')
    const recent = await prisma.$queryRaw`SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 20`;
    console.table(recent)

    console.log('\n2) Table existence:')
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('JournalEntry','ReconciliationException','SubledgerReconciliation','Estimate')`;
    console.table(tables)

    console.log('\n3) Column presence:')
    const cols = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('JournalEntry','ReconciliationException') AND column_name IN ('reviewedById','reviewedAt','approvedById','approvedAt','reviewNotes','approvalNotes','subledgerReconciliationId')`;
    console.table(cols)

    console.log('\n4) Enum types & values:')
    const enums = await prisma.$queryRaw`SELECT t.typname AS enum_type, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid WHERE t.typname IN ('postingstatus','subledgertype','reconciliationstatus','estimatetype','estimatestatus') GROUP BY t.typname`;
    console.table(enums)

    console.log('\n4b) Enum type wildcard matches:')
    const enumMatches = await prisma.$queryRaw`SELECT t.typname FROM pg_type t WHERE t.typname ILIKE ANY (ARRAY['%post%','%subledger%','%reconcil%','%estimate%','%estimate%'])`;
    console.table(enumMatches)

    console.log('\n5) Expected FKs:')
    const fks = await prisma.$queryRaw`SELECT conname FROM pg_constraint WHERE conname IN ('SubledgerReconciliation_company_fkey','Estimate_company_fkey','ReconciliationException_subledger_recon_fkey','JournalEntry_reviewedBy_fkey','JournalEntry_approvedBy_fkey')`;
    console.table(fks)

    console.log('\n6) Index check (samples):')
    const idxs = await prisma.$queryRaw`SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('SubledgerReconciliation','Estimate','JournalEntry','ReconciliationException') ORDER BY tablename, indexname`;
    console.table(idxs)

    console.log('\n7) Row counts (sanity):')
    const counts = await prisma.$queryRaw`SELECT 'SubledgerReconciliation' AS t, count(*) FROM public."SubledgerReconciliation" UNION ALL SELECT 'Estimate', count(*) FROM public."Estimate" UNION ALL SELECT 'JournalEntry_newcols', count(*) FROM public."JournalEntry" WHERE "reviewedById" IS NOT NULL OR "approvedById" IS NOT NULL`;
    console.table(counts)

    console.log('\nDiagnostics complete.')
  } catch (e) {
    console.error('Error running diagnostics:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

run()
