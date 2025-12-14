const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma')
const expectedPath = path.resolve(__dirname, './expected_schema.json')

function readPrismaModels(schemaContent) {
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{/g
  const models = new Set()
  let m
  while ((m = modelRegex.exec(schemaContent)) !== null) {
    models.add(m[1])
  }
  return Array.from(models)
}

async function main() {
  const schema = fs.readFileSync(schemaPath, 'utf8')
  const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'))
  const modelsInSchema = readPrismaModels(schema)

  console.log('Checking Prisma schema for expected models...')
  const missing = []
  for (const m of expected) {
    if (!modelsInSchema.includes(m.name)) missing.push(m.name)
  }
  if (missing.length > 0) {
    console.error(`❌ Missing ${missing.length} models in schema.prisma:`)
    missing.forEach(n => console.error(`   - ${n}`))
    process.exit(1)
  }
  console.log(`✅ All ${expected.length} expected models present in schema.prisma`)

  // Now check live DB for tables and tenantId columns where applicable
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  // determine Tenant.id pg type name
  const tenantTypeRes = await c.query(`
    SELECT pg_type.typname FROM pg_attribute
    JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
    JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
    WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'
  `)
  const tenantType = tenantTypeRes.rows[0]?.typname
  console.log(`Tenant.id type: ${tenantType}`)

  console.log('\nChecking database tables and tenantId columns...')
  const dbMissing = []
  const tenantMissing = []
  const missingColumns = []
  const typeMismatches = []
  for (const m of expected) {
    const nameLower = m.name.toLowerCase()
    // try both lowercase and exact
    const res = await c.query(`SELECT table_name FROM information_schema.tables WHERE (table_name = $1 OR table_name = $2) AND table_schema = 'public'`, [nameLower, m.name])
    if (res.rowCount === 0) {
      dbMissing.push(m.name)
      continue
    }
    if (m.tenantScoped) {
      const colRes = await c.query(`SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND (table_name = $1 OR table_name = $2) AND column_name = 'tenantId'`, [nameLower, m.name])
      if (colRes.rowCount === 0) {
        tenantMissing.push(m.name)
      } else {
        const udt = colRes.rows[0].udt_name
        if (tenantType && udt !== tenantType) {
          typeMismatches.push({ table: m.name, column: 'tenantId', dbType: udt, expected: tenantType })
        }
      }
    }
    // tenantId index expectation
    if (m.expectsTenantIndex) {
      const idxRes = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND (tablename = $1 OR tablename = $2) AND indexdef ILIKE '%tenantId%';`, [nameLower, m.name])
      if (idxRes.rowCount === 0) {
        missingColumns.push({ table: m.name, column: 'INDEX(tenantId)' })
      }
    }
    // requiredColumns checks
    if (m.requiredColumns && m.requiredColumns.length > 0) {
      for (const rc of m.requiredColumns) {
        const colRes = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND (table_name = $1 OR table_name = $2) AND column_name = $3`, [nameLower, m.name, rc])
        if (colRes.rowCount === 0) missingColumns.push({ table: m.name, column: rc })
      }
    }
  }

  if (dbMissing.length > 0) {
    console.error(`❌ Missing ${dbMissing.length} tables in DB:`)
    dbMissing.forEach(n => console.error(`   - ${n}`))
    await c.end()
    process.exit(1)
  }
  console.log(`✅ All ${expected.length} expected tables present in DB`)

  if (tenantMissing.length > 0) {
    console.error(`❌ ${tenantMissing.length} tenant-scoped models missing tenantId column:`)
    tenantMissing.forEach(n => console.error(`   - ${n}`))
    await c.end()
    process.exit(1)
  }
  console.log(`✅ All tenant-scoped models have tenantId columns in DB`)

  if (missingColumns.length > 0) {
    console.error(`❌ Found ${missingColumns.length} missing required columns:`)
    missingColumns.forEach(m => console.error(`   - ${m.table}: ${m.column}`))
    await c.end()
    process.exit(1)
  }
  // Optionally fail if backup columns exist
  const failOnBackups = process.env.FAIL_ON_BACKUP_COLUMNS === '1' || process.env.FAIL_ON_BACKUP_COLUMNS === 'true'
  if (failOnBackups) {
    const txtRes = await c.query(`SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_txt' AND table_schema = 'public'`)
    const oldRes = await c.query(`SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_uuid_old' AND table_schema = 'public'`)
    if (txtRes.rowCount > 0 || oldRes.rowCount > 0) {
      console.error('❌ Found backup tenantId_txt or tenantId_uuid_old columns in DB:')
      txtRes.rows.forEach(r => console.error(`  - tenantId_txt: ${r.table_name}`))
      oldRes.rows.forEach(r => console.error(`  - tenantId_uuid_old: ${r.table_name}`))
      await c.end()
      process.exit(1)
    }
  }
  if (typeMismatches.length > 0) {
    console.error(`❌ Found ${typeMismatches.length} column type mismatches:`)
    typeMismatches.forEach(m => console.error(`   - ${m.table}.${m.column}: ${m.dbType} != ${m.expected}`))
    await c.end()
    process.exit(1)
  }
  await c.end()
  console.log('\n✅ Schema completeness checks passed')
}

main().catch(e => { console.error('❌ Schema completeness check failed:', e.message); process.exit(1) })
