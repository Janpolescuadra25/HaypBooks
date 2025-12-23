const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query("SELECT table_name, udt_name FROM information_schema.columns WHERE column_name='tenantId' ORDER BY table_name");
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });