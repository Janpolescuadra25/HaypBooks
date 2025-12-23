const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query('SELECT id FROM "Tenant" LIMIT 5');
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });