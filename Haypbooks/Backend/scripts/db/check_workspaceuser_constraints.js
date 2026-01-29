const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const names = ['CompanyUser_tenantId_userId_fkey_new','PracticeUser_tenantId_userId_fkey_new','WorkspaceUser_tenant_user_unique'];
  const res = await c.query(`select conname, convalidated, contype, conrelid::regclass::text as tbl from pg_constraint where conname = ANY($1)`, [names]);
  console.log('constraints:', res.rows);
  const idx = await c.query(`select indexname, indexdef from pg_indexes where indexname = ANY($1)`, [names]);
  console.log('indexes:', idx.rows);
  await c.end();
})();
