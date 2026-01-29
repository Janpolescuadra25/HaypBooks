const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  for (const t of ['WorkspaceUser','CompanyUser','PracticeUser']){
    const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [t]);
    console.log('---', t);
    console.log(r.rows);
  }
  await c.end();
})();
