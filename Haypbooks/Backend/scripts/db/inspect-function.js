const {Client} = require('pg');
const name = process.argv[2];
(async()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test' });
  await c.connect();
  const q = `SELECT proname, prosrc, proargnames, prorettype::regtype as return_type, lanname FROM pg_proc JOIN pg_language ON pg_language.oid = pg_proc.prolang WHERE proname = $1`;
  const r = await c.query(q, [name]);
  console.log(JSON.stringify(r.rows[0] || {},null,2));
  await c.end();
})();
