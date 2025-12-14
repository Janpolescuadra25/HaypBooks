const { Client } = require('pg');
const name = process.argv[2];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test' });
  await c.connect();
  const r = await c.query('SELECT oid FROM pg_proc WHERE proname = $1', [name]);
  if (r.rows.length === 0) {
    console.log('Function not found:', name);await c.end();return;
  }
  const oid = r.rows[0].oid;
  const res = await c.query('SELECT pg_get_functiondef($1::oid) as def', [oid]);
  console.log(res.rows[0].def);
  await c.end();
})();
