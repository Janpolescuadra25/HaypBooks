const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query("SELECT conname, conrelid::regclass::text AS tablename FROM pg_constraint WHERE confrelid = 'public.\"Tenant\"'::regclass AND contype = 'f'");
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });