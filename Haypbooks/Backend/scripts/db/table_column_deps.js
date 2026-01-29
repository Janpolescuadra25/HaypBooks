const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  const table = process.argv[3];
  const col = process.argv[4];
  if (!conn || !table || !col) { console.error('Usage: node table_column_deps.js <conn> <table> <column>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const rel = await c.query(`SELECT c.oid FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = $1 AND n.nspname = 'public'`, [table]);
  if (rel.rowCount === 0) { console.error(table, 'not found'); await c.end(); process.exit(1); }
  const relOid = rel.rows[0].oid;
  const att = await c.query(`SELECT attnum FROM pg_attribute WHERE attrelid = $1 AND attname = $2`, [relOid, col]);
  if (att.rowCount === 0) { console.log(col, 'not found on', table); await c.end(); return; }
  const attnum = att.rows[0].attnum;
  const deps = await c.query(`SELECT d.objid::regclass::text as dependent_obj, d.classid::regclass::text as class, d.deptype FROM pg_depend d WHERE d.refobjid = $1 AND d.refobjsubid = $2`, [relOid, attnum]);
  console.log('Dependencies on', `${table}.${col}:`, deps.rows);
  await c.end();
})();