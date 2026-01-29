import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run() {
  console.log('[DIAG] Finding columns named tenantId_old...')
  const cols: Array<{ table_schema: string; table_name: string }> = await prisma.$queryRawUnsafe(
    `SELECT table_schema, table_name FROM information_schema.columns WHERE lower(column_name) = 'tenantid_old' ORDER BY table_schema, table_name;`
  )

  if (!cols || cols.length === 0) {
    console.log('[DIAG] No tenantId_old columns found. Nothing to diagnose.')
    return
  }

  const report: Record<string, any> = {}

  for (const c of cols) {
    const key = `${c.table_schema}.${c.table_name}`
    report[key] = { constraintsOnColumn: [], fksReferencingColumn: [], indexes: [], views: [], triggers: [], functions: [], otherOccurrences: [] }

    // 1) Constraints on the column in this table
    const constraints = await prisma.$queryRawUnsafe(
      `SELECT tc.constraint_name, tc.constraint_type, pg_get_constraintdef(pc.oid) as definition
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
       LEFT JOIN pg_catalog.pg_constraint pc ON pc.conname = tc.constraint_name
       WHERE kcu.table_schema = $1 AND kcu.table_name = $2 AND lower(kcu.column_name) = 'tenantid_old'`,
      c.table_schema,
      c.table_name
    )
    report[key].constraintsOnColumn = constraints

    // 2) Foreign keys in other tables that reference this table's tenantId_old
    const fks = await prisma.$queryRawUnsafe(
      `SELECT pc.conname AS fk_name, pn.nspname AS fk_schema, rc.relname AS fk_table, pg_get_constraintdef(pc.oid) AS definition
       FROM pg_constraint pc
       JOIN pg_class rc ON rc.oid = pc.conrelid
       JOIN pg_namespace pn ON pn.oid = rc.relnamespace
       JOIN pg_class cc ON cc.oid = pc.confrelid
       JOIN pg_namespace cn ON cn.oid = cc.relnamespace
       WHERE pc.contype = 'f' AND cc.relname = $2 AND cn.nspname = $1
         AND EXISTS (
           SELECT 1 FROM unnest(pc.confkey) ck(attnum)
           JOIN pg_attribute pa ON pa.attrelid = cc.oid AND pa.attnum = ck.attnum
           WHERE pa.attname = 'tenantId_old'
         )`,
      c.table_schema,
      c.table_name
    )
    report[key].fksReferencingColumn = fks

    // 3) Indexes on this table that include tenantId_old
    const indexes = await prisma.$queryRawUnsafe(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2 AND indexdef ILIKE '%tenantid_old%';`,
      c.table_schema,
      c.table_name
    )
    report[key].indexes = indexes

    // 4) Views that reference tenantId_old (anywhere in definition)
    const views = await prisma.$queryRawUnsafe(
      `SELECT table_schema, table_name, view_definition FROM information_schema.views WHERE lower(view_definition) LIKE '%tenantid_old%' ORDER BY table_schema, table_name;`)
    report[key].views = ((views as any[]) || []).filter((v: any) => v.table_schema === c.table_schema || v.table_schema === 'public')

    // 5) Triggers attached to this table (and trigger functions that reference the column)
    const triggers = await prisma.$queryRawUnsafe(
      `SELECT tg.tgname as trigger_name, (tg.tgrelid::regclass::text) as table_name, pg_get_triggerdef(tg.oid) as definition
       FROM pg_trigger tg
       JOIN pg_class rc ON rc.oid = tg.tgrelid
       JOIN pg_namespace rn ON rn.oid = rc.relnamespace
       WHERE (rn.nspname = $1 AND rc.relname = $2) OR pg_get_triggerdef(tg.oid) ILIKE '%tenantid_old%';`,
      c.table_schema,
      c.table_name
    )
    report[key].triggers = triggers

    // 6) Functions where body references tenantId_old
    const funcs = await prisma.$queryRawUnsafe(
      `SELECT n.nspname AS schema, p.proname AS function_name, p.oid, substring(p.prosrc for 800) AS snippet
       FROM pg_proc p
       JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE p.prosrc ILIKE '%tenantid_old%';`
    )
    report[key].functions = funcs

    // 7) Catch-all: search views, rules, matviews, functions for occurrences of the string
    const other = await prisma.$queryRawUnsafe(
      `SELECT 'view' AS type, table_schema, table_name, view_definition as snippet FROM information_schema.views WHERE view_definition ILIKE '%tenantid_old%'
       UNION ALL
       SELECT 'matview' AS type, schemaname AS table_schema, matviewname AS table_name, definition AS snippet FROM pg_matviews WHERE definition ILIKE '%tenantid_old%'
       UNION ALL
       SELECT 'function' AS type, n.nspname AS table_schema, p.proname AS table_name, substring(p.prosrc for 800) AS snippet FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.prosrc ILIKE '%tenantid_old%';`
    )
    report[key].otherOccurrences = other
  }

  console.log(JSON.stringify(report, null, 2))
}

run()
  .catch((e) => {
    console.error('[DIAG] Fatal error', e)
    process.exitCode = 2
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
