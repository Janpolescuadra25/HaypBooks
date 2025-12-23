const { Client } = require('pg');
const table = process.argv[2];
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query("SELECT indexname FROM pg_indexes WHERE tablename=$1", [table]);
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });