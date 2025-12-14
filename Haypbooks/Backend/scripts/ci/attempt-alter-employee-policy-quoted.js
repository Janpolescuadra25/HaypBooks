const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  try {
    const res = await c.query('ALTER POLICY "tenant_isolation_Employee" ON public."Employee" USING (("tenantId")::text = current_setting(\'hayp.tenant_id\'::text)) WITH CHECK (("tenantId")::text = current_setting(\'hayp.tenant_id\'::text))')
    console.log('ALTER success', res.command)
  } catch (e) {
    console.error('ALTER failed', e.message)
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
