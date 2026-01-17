#!/usr/bin/env node
const { Client } = require('pg')

// Idempotent consolidation of tenantId columns
// Actions per table:
// - If tenantId_new exists and tenantId is NULL in some rows, copy tenantId_new into tenantId (cast to text)
// - If tenantId_new exists and all non-null tenantId rows match tenantId_new, drop tenantId_new
// - If tenantId_old exists and has no dependent objects, drop it; otherwise log and skip

;(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: cs })
  await client.connect()
  try {
    console.log('Inspecting tables for tenantId consolidation...')
    const tablesRes = await client.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND (column_name='tenantId' OR column_name='tenantId_new' OR column_name='tenantId_old') GROUP BY table_name")
    const tables = tablesRes.rows.map(r => r.table_name)
    for (const table of tables) {
      console.log(`\n--- Table: ${table}`)
      const colsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [table])
      const cols = colsRes.rows.map(r => r.column_name)
      const hasNew = cols.includes('tenantid_new') || cols.includes('tenantId_new')
      const hasOld = cols.includes('tenantid_old') || cols.includes('tenantId_old')
      const hasCur = cols.includes('tenantid') || cols.includes('tenantId')

      // Normalize real column names' casing
      const cname = cols.find(c => c.toLowerCase() === 'tenantid')
      const nname = cols.find(c => c.toLowerCase() === 'tenantid_new')
      const oname = cols.find(c => c.toLowerCase() === 'tenantid_old')

      // If tenantId_new exists and tenantId is present, copy where tenantId is null
      if (nname && cname) {
        console.log('  tenantId_new and tenantId both present; syncing nulls from tenantId_new -> tenantId')
        const copySql = `UPDATE public."${table}" SET "${cname}" = "${nname}"::text WHERE ("${cname}" IS NULL OR "${cname}" = '') AND ("${nname}" IS NOT NULL)`
        const r = await client.query(copySql)
        console.log(`    Copied ${r.rowCount} rows`)    

        // If no mismatches remain (i.e., for rows where both present, they match), we can drop tenantId_new
        const mismatchRes = await client.query(`SELECT 1 FROM public."${table}" WHERE "${nname}" IS NOT NULL AND ("${cname}" IS NULL OR "${cname}"::text <> "${nname}"::text) LIMIT 1`)
        if (mismatchRes.rows.length === 0) {
          try {
            await client.query(`ALTER TABLE public."${table}" DROP COLUMN IF EXISTS "${nname}"`)
            console.log(`    Dropped column ${nname}`)
          } catch (e) {
            console.warn(`    Could not drop ${nname}:`, e.message)
          }
        } else {
          console.warn('    Cannot safely drop tenantId_new: mismatching rows found; leaving for manual review')
        }
      }

      // If tenantId_new exists and tenantId does NOT exist, rename tenantId_new -> tenantId
      if (nname && !cname) {
        try {
          await client.query(`ALTER TABLE public."${table}" RENAME COLUMN "${nname}" TO "tenantId"`)
          console.log(`  Renamed ${nname} -> tenantId`)
        } catch (e) {
          console.warn(`  Failed to rename ${nname} -> tenantId:`, e.message)
        }
      }

      // Drop tenantId_old if no dependent objects
      if (oname) {
        try {
          // Ensure tenantId_old is not referenced by FKs
          const fkCheck = await client.query(`SELECT constraint_name FROM information_schema.constraint_column_usage WHERE table_name = $1 AND column_name = $2 LIMIT 1`, [table, oname])
          if (fkCheck.rows.length > 0) {
            console.warn(`  tenantId_old (${oname}) has dependent constraints (${fkCheck.rows[0].constraint_name}), skipping drop`)
          } else {
            await client.query(`ALTER TABLE public."${table}" DROP COLUMN IF EXISTS "${oname}"`)
            console.log(`  Dropped ${oname}`)
          }
        } catch (e) {
          console.warn(`  Failed to drop ${oname}:`, e.message)
        }
      }
    }
    console.log('\nConsolidation complete')
  } catch (e) {
    console.error('Error during consolidation:', e.message || e)
    process.exit(1)
  } finally {
    await client.end()
  }
})().catch(e=>{ console.error(e); process.exit(1) })
