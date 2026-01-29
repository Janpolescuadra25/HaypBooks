const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  const c = new Client({ connectionString: conn });
  await c.connect();
  const r = await c.query(`
    SELECT polname, polrelid::regclass::text as tbl, pg_get_expr(polqual, polrelid) as using_expr, pg_get_expr(polwithcheck, polrelid) as withcheck_expr
    FROM pg_policy WHERE polname ILIKE 'tenant_isolation_%'
  `);
  console.log('tenant isolation policies:\n', r.rows);
  await c.end();
})();
