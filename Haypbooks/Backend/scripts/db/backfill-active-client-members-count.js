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
    await c.query('UPDATE public."Tenant" SET "active_non_owner_users_count" = 0')

    const rows = await c.query(
      'SELECT "tenantId", COUNT(*)::int AS cnt FROM public."TenantUser" WHERE status = $1 AND "isOwner" = false GROUP BY "tenantId"',
      ['ACTIVE'],
    )

    for (const r of rows.rows) {
      await c.query('UPDATE public."Tenant" SET "active_non_owner_users_count" = $2 WHERE id::text = $1::text', [r.tenantId, r.cnt])
    }

    console.log(`Backfilled activeNonOwnerUsersCount for ${rows.rows.length} tenants.`)
  } catch (e) {
    console.error('Backfill failed:', e?.message || e)
    process.exit(2)
  } finally {
    await c.end()
  }
})()
