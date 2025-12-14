const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test' });
  await c.connect();
  const res = await c.query("SELECT conname, contype, convalidated, confrelid::regclass::text as referenced_table, conrelid::regclass::text as table_name, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE contype = 'f' ORDER BY NOT convalidated, conname;");
  console.log(JSON.stringify(res.rows, null, 2));
  await c.end();
})();
