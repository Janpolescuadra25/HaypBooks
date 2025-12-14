const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  try {
    const exists = await c.query("SELECT 1 FROM pg_constraint WHERE conname = 'Employee_tenant_fkey'")
    if (exists.rowCount === 0) {
      await c.query('ALTER TABLE public."Employee" ADD CONSTRAINT "Employee_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID')
      console.log('Constraint Employee_tenant_fkey added as NOT VALID')
    } else {
      console.log('Constraint Employee_tenant_fkey already exists')
    }
  } catch (e) {
    console.error('Failed to add constraint:', e.message)
  } finally {
    await c.end()
  }
})().catch(e=>{ console.error(e); process.exit(1) })
