#!/usr/bin/env node
const { Client } = require('pg')
(async () => {
  const path = require('path') // no dotenv here, we pass DATABASE_URL explicitly for test runs
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name='Tenant' AND column_name='id_old'")
    console.log(res.rows)
  } catch (e) {
    console.error('Error:', e.message || e)
    process.exit(1)
  } finally {
    await c.end()
  }
})()
