const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query("SELECT indexname FROM pg_indexes WHERE tablename='TenantInvite'");
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });