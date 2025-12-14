#!/usr/bin/env node
const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query(`
      SELECT table_name FROM information_schema.columns
      WHERE lower(column_name) IN ('tenant_id','tenantid') AND table_schema = 'public'
      GROUP BY table_name
      HAVING NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = information_schema.columns.table_name
      )
    `)
    const missing = res.rows.map(r => r.table_name)

    // Heuristic priority ordering by keywords
    const priorityKeywords = ['invoice','payment','journal','bank','bill','purchase','customer','vendor','inventory','stock','account','payroll']
    const prioritized = missing.sort((a,b) => {
      const aScore = priorityKeywords.reduce((s,k)=> s + (a.toLowerCase().includes(k)?1:0), 0)
      const bScore = priorityKeywords.reduce((s,k)=> s + (b.toLowerCase().includes(k)?1:0), 0)
      return bScore - aScore || a.localeCompare(b)
    })

    console.log('RLS candidates (prioritized):')
    prioritized.forEach((t,i)=> console.log(`${i+1}. ${t}`))

    // Suggest a default Phase 2 batch (top 20)
    const suggested = prioritized.slice(0,20)
    console.log('\nSuggested Phase 2 batch (top 20):')
    console.log(suggested.join(', '))
    await client.end()
  } catch (e) {
    console.error('Failed to list candidates:', e.message)
    await client.end()
    process.exit(1)
  }
}

main()
