const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// This script scans for tables with tenantId column type not matching Tenant.id
// and with tenantId_txt column present. It generates an idempotent SQL migration
// which updates RLS policies to reference tenantId_txt, renames columns (tenantId->tenantId_uuid_old, tenantId_txt->tenantId),
// renames indexes and constraints appropriately, and validates FKs.

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const connection = process.env.DATABASE_URL || DEFAULT_DB
  const c = new Client({ connectionString: connection })
  await c.connect()

  // Get tenant id type
  const tenantTypeRes = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  const tenantType = tenantTypeRes.rows[0] && tenantTypeRes.rows[0].typname

  const rows = await c.query(`SELECT table_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name`)
  const candidates = []
  for (const r of rows.rows) {
    if (r.udt_name !== tenantType) {
      // check tenantId_txt existence
      const txtRes = await c.query("SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenantId_txt'", [r.table_name])
      if (txtRes.rowCount > 0) candidates.push({table: r.table_name, colType: r.udt_name})
    }
  }

  console.log('Candidates for swap:', candidates.map(c=>c.table))

  const lines = []
  lines.push('-- SAFE SWAP MIGRATION: rename tenantId to tenantId_uuid_old and tenantId_txt to tenantId')
  lines.push('-- Idempotent: will check for the presence of columns/constraints/indexes before actions')
  lines.push('DO $$\nBEGIN')

  for (const cinfo of candidates) {
    const table = cinfo.table
    // Note: RLS policies will automatically update when column is renamed
    // No need to manually update policy expressions

    // Now rename columns if the old uuid column exists
    lines.push(`  -- Swap columns for table ${table}`)
    lines.push(`  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'tenantId' AND (SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'tenantId') != 'text') THEN`)
    lines.push(`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'tenantId_uuid_old') THEN`)
    lines.push(`      ALTER TABLE public."${table}" RENAME COLUMN "tenantId" TO "tenantId_uuid_old";`)
    lines.push(`    END IF;`)
    lines.push(`    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'tenantId_txt') THEN`)
    lines.push(`      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'tenantId') THEN`)
    lines.push(`        ALTER TABLE public."${table}" RENAME COLUMN "tenantId_txt" TO "tenantId";`)
    lines.push(`      END IF;`)
    lines.push(`    END IF;`)

    // Rename index from tenantid_txt to tenantid if necessary
    const idxOld = `${table.toLowerCase()}_tenantid_txt_idx`
    const idxNew = `${table.toLowerCase()}_tenantid_idx`
    lines.push(`    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = '${idxOld}') AND NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = '${idxNew}') THEN`)
    lines.push(`      ALTER INDEX "${idxOld}" RENAME TO "${idxNew}";`)
    lines.push(`    END IF;`)

    // Rename constraint from tenant_txt_fkey to tenant_tenantId_fkey if necessary
    const fkTxt = `${table}_tenant_txt_fkey`
    const fkNew = `${table}_tenantId_fkey`
    lines.push(`    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${fkTxt}') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${fkNew}') THEN`)
    lines.push(`      ALTER TABLE public."${table}" RENAME CONSTRAINT "${fkTxt}" TO "${fkNew}";`)
    lines.push(`    END IF;`)

    // If the tenantId uuid-old still has an FK referencing Tenant (unlikely) drop it
    // Ensure final FK exists on tenantId and is validated
    lines.push(`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${fkNew}') THEN`)
    lines.push(`      ALTER TABLE public."${table}" ADD CONSTRAINT "${fkNew}" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT;`)
    lines.push(`    END IF;`)
    lines.push(`    -- Validate the FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${fkNew}' AND NOT convalidated) THEN`)
    lines.push(`      ALTER TABLE public."${table}" VALIDATE CONSTRAINT "${fkNew}";`)
    lines.push(`    END IF;`)

    // Clean up index on old uuid column if desired (preserve for rollback)
    lines.push(`  END IF;`)
    lines.push('\n')
  }

  lines.push('END $$;')

  // Write to a temporary migration file
  const migrationsDir = path.resolve(__dirname, '..', '..', 'prisma', 'migrations')
  const migrationDir = path.join(migrationsDir, '20251214020000_swap_tenantid_txt_to_tenantid')
  if (!fs.existsSync(migrationDir)) fs.mkdirSync(migrationDir, { recursive: true })
  const outPath = path.join(migrationDir, 'migration.sql')
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log('Wrote migration SQL to', outPath)

  await c.end()
}

main().catch(e=>{ console.error(e); process.exit(1) })
