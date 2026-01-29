const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node workspaceuser_column_deps.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const res = await c.query(`
    SELECT a.attname, d.objid::regclass::text as dependent_obj, d.deptype, d.classid::regclass::text as class
    FROM pg_attribute a
    JOIN pg_depend d ON d.refobjid = a.attrelid AND d.refobjsubid = a.attnum
    WHERE a.attrelid = 'WorkspaceUser'::regclass AND a.attname = 'tenantId_old'
  `);
  console.log('dependents on WorkspaceUser.tenantId_old:', res.rows);
  await c.end();
})();
