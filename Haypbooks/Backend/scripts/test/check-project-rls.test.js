const { Client } = require('pg')

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  try {
    const res = await c.query("SELECT polname FROM pg_policy WHERE polname IN ('tenant_isolation_Project','tenant_isolation_ProjectLine','tenant_isolation_RevenueRecognitionSchedule')")
    const found = res.rows.map(r => r.polname)
    console.log('Found policies:', found)
    const missing = ['tenant_isolation_Project','tenant_isolation_ProjectLine','tenant_isolation_RevenueRecognitionSchedule'].filter(p => !found.includes(p))
    if (missing.length) {
      console.error('Missing policies:', missing)
      process.exit(2)
    }
    console.log('✅ All project RLS policies present.')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await c.end()
  }
}

main()
