const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='Timesheet'");
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1); });
