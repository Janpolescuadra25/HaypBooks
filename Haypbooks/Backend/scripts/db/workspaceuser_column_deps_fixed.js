const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node workspaceuser_column_deps_fixed.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const rel = await c.query(`SELECT c.oid FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'WorkspaceUser' AND n.nspname = 'public'`);
  if (rel.rowCount === 0) { console.error('WorkspaceUser relation not found'); await c.end(); process.exit(1); }
  const relOid = rel.rows[0].oid;
  const att = await c.query(`SELECT attnum FROM pg_attribute WHERE attrelid = $1 AND attname = 'tenantId_old'`, [relOid]);
  if (att.rowCount === 0) { console.log('tenantId_old attribute not found on WorkspaceUser (already removed?)'); await c.end(); return; }
  const attnum = att.rows[0].attnum;
  const deps = await c.query(`SELECT d.objid::regclass::text as dependent_obj, d.objid, d.objsubid, d.deptype, d.classid::regclass::text as class FROM pg_depend d WHERE d.refobjid = $1 AND d.refobjsubid = $2`, [relOid, attnum]);
  console.log('Dependencies on WorkspaceUser.tenantId_old:', deps.rows);
  await c.end();
})();