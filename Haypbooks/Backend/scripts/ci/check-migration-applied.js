const { Client } = require('pg');
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';
;
(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB });
  await c.connect();
  const r = await c.query('select name, state from "SchemaMigration" where name like $1 order by name desc', ['%add_missing_tenant_fks%']);
  console.log(r.rows);
  await c.end();
})();
