const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

function timestamp() {
  const d = new Date()
  const YYYY = d.getUTCFullYear()
  const MM = String(d.getUTCMonth() + 1).padStart(2, '0')
  const DD = String(d.getUTCDate()).padStart(2, '0')
  const HH = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`
}

;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  const colRes = await c.query(`
    SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_txt' AND table_schema = 'public' ORDER BY table_name
  `)
  if (colRes.rowCount === 0) {
    console.log('No tenantId_txt columns found; nothing to generate')
    await c.end()
    return
  }

  const stmts = []
  for (const row of colRes.rows) {
    const tbl = row.table_name
    // drop any constraints that reference tenantId_txt
    const fkRes = await c.query(`
      SELECT constraint_name FROM information_schema.key_column_usage WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenantId_txt'
    `, [tbl])
    for (const fk of fkRes.rows) {
      stmts.push(`ALTER TABLE public."${tbl}" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}";`)
    }
    stmts.push(`ALTER TABLE public."${tbl}" DROP COLUMN IF EXISTS "tenantId_txt";`)
  }

  // Also prepare drops for tenantId_uuid_old columns (backup uuid columns)
  const oldRes = await c.query(`
    SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_uuid_old' AND table_schema = 'public' ORDER BY table_name
  `)
  if (oldRes.rowCount > 0) {
    stmts.push('\n-- tenantId_uuid_old cleanup statements:')
    for (const row of oldRes.rows) {
      const tbl = row.table_name
      // For each index that references tenantId_uuid_old, create an equivalent index on tenantId
      const idxRes = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename = $1 AND indexdef ILIKE '%tenantId_uuid_old%';`, [tbl])
      for (const idx of idxRes.rows) {
        // build a new index name with a safe suffix to avoid collisions
        const newIndexName = `${idx.indexname}_tenantid`;
        // extract columns parentheses content from the indexdef
        const colsMatch = idx.indexdef.match(/\(([^)]+)\)/)
        const cols = colsMatch ? colsMatch[1].replace(/tenantId_uuid_old/g, 'tenantId') : '"tenantId"'
        stmts.push(`-- Create equivalent index ${newIndexName} on tenantId for table ${tbl}`)
        stmts.push(`CREATE INDEX IF NOT EXISTS ${newIndexName} ON public."${tbl}" (${cols});`)
        // now drop the old index
        stmts.push(`DROP INDEX IF EXISTS ${idx.indexname};`)
      }
      // Find unique or named constraints that reference tenantId_uuid_old and recreate using tenantId if possible
      const conRes = await c.query(`SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = $1) AND pg_get_constraintdef(oid) ILIKE '%tenantId_uuid_old%';`, [tbl])
      for (const con of conRes.rows) {
        // If unique constraint, create a replacement unique index on tenantId and drop the constraint
        if (/UNIQUE/i.test(con.def)) {
          // Generate a new unique index name to avoid collision
          const newName = `${con.conname}_tenantid`;
          // extract columns from unique def
          const cols = (con.def.match(/\((.*)\)/) || [])[1].replace(/tenantId_uuid_old/g, 'tenantId')
          stmts.push(`CREATE UNIQUE INDEX IF NOT EXISTS ${newName} ON public."${tbl}" (${cols});`)
        }
        stmts.push(`ALTER TABLE public."${tbl}" DROP CONSTRAINT IF EXISTS "${con.conname}";`)
      }
      // RLS policies referencing tenantId_uuid_old: recreate using tenantId
      const policyRes = await c.query(`SELECT polname, polcmd, polpermissive, pg_get_expr(polqual, polrelid) as qual, pg_get_expr(polwithcheck, polrelid) as withcheck FROM pg_policy WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = $1) AND (pg_get_expr(polqual, polrelid) ILIKE '%tenantId_uuid_old%' OR pg_get_expr(polwithcheck, polrelid) ILIKE '%tenantId_uuid_old%');`, [tbl])
      for (const p of policyRes.rows) {
        const newQual = p.qual ? p.qual.replace(/tenantId_uuid_old/g, 'tenantId') : null
        const newWith = p.withcheck ? p.withcheck.replace(/tenantId_uuid_old/g, 'tenantId') : null
        stmts.push(`-- Replace policy ${p.polname} to reference tenantId for table ${tbl}`)
        stmts.push(`DROP POLICY IF EXISTS ${p.polname} ON public."${tbl}";`)
        const cmd = p.polcmd.toUpperCase() === 'ALL' ? 'FOR ALL' : `FOR ${p.polcmd.toUpperCase()}`
        let create = `CREATE POLICY ${p.polname} ON public."${tbl}" ${cmd}`
        if (newQual) create += ` USING (${newQual})`
        if (newWith) create += ` WITH CHECK (${newWith})`
        create += ';'
        stmts.push(create)
      }
      // Ensure the column is not NOT NULL
      stmts.push(`ALTER TABLE public."${tbl}" ALTER COLUMN "tenantId_uuid_old" DROP NOT NULL;`)
      stmts.push(`ALTER TABLE public."${tbl}" DROP COLUMN IF EXISTS "tenantId_uuid_old";`)
    }
  }

  if (stmts.length === 0) {
    console.log('No cleanup statements generated')
    await c.end()
    return
  }

  const ts = timestamp()
  // Use Backend/prisma location instead of repo-level prisma folder
  const migrationDir = path.resolve(__dirname, `../prisma/migrations/${ts}_drop_tenantid_backups`)
  fs.mkdirSync(migrationDir, { recursive: true })
  const migrationFile = path.join(migrationDir, 'migration.sql')
  fs.writeFileSync(migrationFile, `-- Generated cleanup migration to drop tenantId_txt and tenantId_uuid_old backup columns\n${stmts.join('\n')}\n`)
  console.log(`Generated cleanup migration: ${migrationFile}`)

  await c.end()
})().catch(e=>{ console.error('Failed to generate cleanup migration:', e.message); process.exit(1) })
