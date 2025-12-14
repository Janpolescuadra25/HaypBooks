const { Client } = require('pg')
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') })

async function main() {
  const conn = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
  const client = new Client({ connectionString: conn })
  await client.connect()
  const res = await client.query("select column_name, data_type from information_schema.columns where table_name = 'User'")
  console.log(res.rows)
  await client.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
