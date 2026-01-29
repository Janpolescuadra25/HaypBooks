const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const res = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='WorkspaceUser' ORDER BY ordinal_position`);
  console.log('WorkspaceUser columns:\n', res.rows.map(r=>r.column_name).join(', '));
  const res2 = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='CompanyUser' ORDER BY ordinal_position`);
  console.log('CompanyUser columns:\n', res2.rows.map(r=>r.column_name).join(', '));
  const res3 = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='PracticeUser' ORDER BY ordinal_position`);
  console.log('PracticeUser columns:\n', res3.rows.map(r=>r.column_name).join(', '));
  await c.end();
})();
