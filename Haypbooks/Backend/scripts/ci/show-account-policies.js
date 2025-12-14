const { Client } = require('pg')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' })
  await client.connect()
  try {
    const q = `SELECT p.polname, pg_get_expr(p.polqual, p.polrelid) as qual, pg_get_expr(p.polwithcheck, p.polrelid) as withcheck FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'Account'`;
    const res = await client.query(q)
    console.log('Policies for Account:', res.rows)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
