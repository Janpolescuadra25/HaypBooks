const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query(
    "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public'"
  );
  console.log(`Found ${res.rows.length} RLS policies — dropping all...`);

  for (const row of res.rows) {
    const sql = `DROP POLICY IF EXISTS "${row.policyname}" ON "${row.tablename}"`;
    await client.query(sql);
    console.log(`  Dropped: ${row.policyname} on ${row.tablename}`);
  }

  console.log('Done — all RLS policies removed.');
  await client.end();
}

run().catch(err => { console.error(err); process.exit(1); });
