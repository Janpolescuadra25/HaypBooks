const { Client } = require('pg')

;(async () => {
  if (typeof process.env.DATABASE_URL !== 'string') {
    console.error('DATABASE_URL is not a string:', typeof process.env.DATABASE_URL)
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL, 'length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)
    process.exit(2)
  }
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await c.connect()
    // Check Task.archivedAt exists
    const arch = (await c.query("SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='archivedAt'"))
    if (arch.rowCount === 0) {
      console.error('DB assertion failed: Task.archivedAt missing')
      process.exit(2)
    }
    // Ensure at least one tenantId column is uuid
    const tenantUuidCntRow = (await c.query("SELECT COUNT(*) as cnt FROM information_schema.columns WHERE column_name='tenantId' AND udt_name='uuid'"))
    const tenantUuidCnt = parseInt(tenantUuidCntRow.rows[0].cnt, 10)
    if (tenantUuidCnt === 0) {
      console.error('DB assertion failed: no tenantId columns with type uuid')
      process.exit(2)
    }
    console.log('DB assertions ok')
    await c.end()
  } catch (e) {
    console.error('DB assertions error:', e && e.message ? e.message : e)
    try { await c.end() } catch (er) {}
    process.exit(2)
  }
})()
