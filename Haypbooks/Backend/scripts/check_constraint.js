const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await c.connect();
  const r = await c.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname='subscription_owner_xor' OR conname LIKE '%subscription_owner_xor%';");
  console.log(JSON.stringify(r.rows, null, 2));
  await c.end();
})();