const { Client } = require('pg');
const table = process.argv[2];
const column = process.argv[3];
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  const res = await client.query("SELECT udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2", [table, column]);
  console.log(res.rows);
  await client.end();
})().catch(e => { console.error(e); process.exit(1) });