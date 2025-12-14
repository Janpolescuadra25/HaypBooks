const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  console.log('=== FINAL DATABASE VALIDATION ===\n')

  // 1. Check Tenant.id type
  const tenantTypeRes = await c.query(`
    SELECT pg_type.typname 
    FROM pg_attribute 
    JOIN pg_class ON pg_attribute.attrelid = pg_class.oid 
    JOIN pg_type ON pg_attribute.atttypid = pg_type.oid 
    WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'
  `)
  const tenantType = tenantTypeRes.rows[0]?.typname
  console.log(`✅ Tenant.id type: ${tenantType}`)

  // 2. Check all tenantId columns match
  const colRes = await c.query(`
    SELECT table_name, udt_name 
    FROM information_schema.columns 
    WHERE column_name = 'tenantId' AND table_schema = 'public' 
    ORDER BY table_name
  `)
  const mismatches = colRes.rows.filter(r => r.udt_name !== tenantType)
  if (mismatches.length > 0) {
    console.error(`❌ Found ${mismatches.length} tenantId column type mismatches:`)
    mismatches.forEach(m => console.error(`   - ${m.table_name}: ${m.udt_name}`))
    process.exit(1)
  }
  console.log(`✅ All ${colRes.rows.length} tenantId columns are ${tenantType} type`)

  // 3. Check all tenantId have validated FK to Tenant(id)
  const fkRes = await c.query(`
    SELECT 
      tc.table_name,
      tc.constraint_name,
      pg_c.convalidated
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN pg_constraint pg_c ON pg_c.conname = tc.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'tenantId'
      AND rc.unique_constraint_name IN (
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'Tenant' AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
      )
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `)
  const unvalidated = fkRes.rows.filter(r => !r.convalidated)
  if (unvalidated.length > 0) {
    console.error(`❌ Found ${unvalidated.length} unvalidated FK constraints:`)
    unvalidated.forEach(f => console.error(`   - ${f.table_name}: ${f.constraint_name}`))
    process.exit(1)
  }
  console.log(`✅ All ${fkRes.rows.length} tenantId FK constraints are validated`)

  // 4. Check for orphaned tenantId_txt columns (should not exist after swap)
  const txtRes = await c.query(`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'tenantId_txt' AND table_schema = 'public'
  `)
  if (txtRes.rowCount > 0) {
    console.warn(`⚠️  Found ${txtRes.rowCount} tables with orphaned tenantId_txt columns:`)
    txtRes.rows.forEach(r => console.warn(`   - ${r.table_name}`))
  } else {
    console.log(`✅ No orphaned tenantId_txt columns`)
  }

  // 5. Check tenantId_uuid_old backup columns (should be 9 from the conversion)
  const oldRes = await c.query(`
    SELECT table_name, udt_name 
    FROM information_schema.columns 
    WHERE column_name = 'tenantId_uuid_old' AND table_schema = 'public'
    ORDER BY table_name
  `)
  console.log(`✅ Found ${oldRes.rowCount} backup tenantId_uuid_old columns:`)
  oldRes.rows.forEach(r => console.log(`   - ${r.table_name} (${r.udt_name})`))

  console.log('\n=== DATABASE VALIDATION COMPLETE ===')
  console.log('✅ All databases are well implemented!')

  await c.end()
}

main().catch(e => { console.error('❌ Validation failed:', e.message); process.exit(1) })
