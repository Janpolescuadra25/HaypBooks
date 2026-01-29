const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const tables = ['WorkspaceUser','CompanyUser','PracticeUser'];
  for (const t of tables) {
    const col = await c.query(`select count(*)::int as has_col from information_schema.columns where table_schema='public' and table_name=$1 and column_name='tenantid_new'`, [t]);
    const hasCol = col.rows[0].has_col === 1;
    if (hasCol) {
      const cnt = await c.query(`select count(*)::int as total, count(tenantid_new)::int as nonnull from public."${t}"`);
      console.log(`${t}: tenantId_new exists — rows total=${cnt.rows[0].total}, tenantId_new non-null=${cnt.rows[0].nonnull}`);
    } else {
      console.log(`${t}: tenantId_new does NOT exist`);
    }
  }
  await c.end();
})();
