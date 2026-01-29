const { Client } = require('pg')

const conn = process.env.DATABASE_URL
if (!conn) {
  console.error('DATABASE_URL is required')
  process.exit(2)
}

;(async () => {
  const c = new Client({ connectionString: conn })
  try {
    await c.connect()
    await c.query('UPDATE public."Tenant" SET "active_companies_count" = 0')

    const rows = await c.query(
      'SELECT "tenantId", COUNT(*)::int AS cnt FROM public."Company" WHERE "isActive" = true GROUP BY "tenantId"',
    )

    for (const r of rows.rows) {
      await c.query('UPDATE public."Tenant" SET "active_companies_count" = $2 WHERE id::text = $1::text', [r.tenantId, r.cnt])
    }

    console.log(`Backfilled activeCompaniesCount for ${rows.rows.length} tenants.`)
  } catch (e) {
    console.error('Backfill failed:', e?.message || e)
    process.exit(2)
  } finally {
    await c.end()
  }
})()
