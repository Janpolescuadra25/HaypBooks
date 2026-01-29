const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const res = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' ORDER BY ordinal_position`);
  console.log('Tenant columns:\n', res.rows);
  await c.end();
})();
