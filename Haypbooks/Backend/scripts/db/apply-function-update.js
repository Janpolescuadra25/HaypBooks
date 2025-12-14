const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'

;(async ()=>{
  const file = path.join(__dirname, '../../prisma/migrations/20251213170000_company_tenant_integrity/migration.sql')
  const sql = fs.readFileSync(file,'utf8')
  const start = sql.indexOf('CREATE OR REPLACE FUNCTION public.ensure_company_belongs_to_tenant()')
  if (start === -1) {
    console.error('Function definition not found in migration file')
    process.exit(1)
  }
  const block = sql.slice(start)
  // We'll execute only up to the next "$$ LANGUAGE plpgsql;" occurrence
  const endIndex = block.indexOf('$$ LANGUAGE plpgsql;')
  if (endIndex === -1) {
    console.error('Could not find end of function body')
    process.exit(1)
  }
  const func_sql = block.slice(0, endIndex + ' $$ LANGUAGE plpgsql;'.length)
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  try {
    const res = await c.query(func_sql)
    console.log('Function replaced successfully')
  } catch (err) {
    console.error('Failed to replace function:', err)
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
