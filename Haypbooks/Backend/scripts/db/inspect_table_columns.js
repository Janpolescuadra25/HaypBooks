#!/usr/bin/env node
const { Client } = require('pg')
const table = process.argv[2]
if (!table) { console.error('Usage: inspect_table_columns.js <table>'); process.exit(1) }
(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query(`SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [table])
    console.log(table, 'columns:')
    for (const r of res.rows) console.log(r)
  } catch (e) {
    console.error('Error:', e.message || e)
    process.exit(1)
  } finally { await c.end() }
})().catch(e=>{console.error(e);process.exit(1)})
