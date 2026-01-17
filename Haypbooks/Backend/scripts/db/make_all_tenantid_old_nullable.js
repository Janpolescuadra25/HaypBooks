#!/usr/bin/env node
const { Client } = require('pg')
;(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: cs })
  await client.connect()
  try {
    const res = await client.query("SELECT table_name FROM information_schema.columns WHERE column_name='tenantId_old' AND table_schema='public'")
    const tables = res.rows.map(r => r.table_name)
    if (!tables.length) {
      console.log('No tenantId_old columns found')
      return
    }
    console.log('Found tenantId_old in tables:', tables)
    for (const t of tables) {
      try {
        await client.query(`ALTER TABLE public."${t}" ALTER COLUMN "tenantId_old" DROP NOT NULL`)
        console.log(`Dropped NOT NULL for ${t}.tenantId_old`)
      } catch (e) {
        console.warn(`Failed to modify ${t}.tenantId_old (continuing):`, e.message)
      }
    }
  } catch (e) {
    console.error('Error querying tenantId_old columns:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
})().catch(e=>{ console.error(e); process.exit(1) })
