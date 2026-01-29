const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  const c = new Client({ connectionString: conn });
  await c.connect();
  // constraint oids we saw
  const oids = [6531800,6531809,6536059];
  const q = `SELECT oid, conname, conrelid::regclass::text as tbl, contype, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE oid = ANY($1::oid[])`;
  const r = await c.query(q, [oids]);
  console.log('constraints:', r.rows);
  const pol = await c.query('SELECT oid, polname, polcmd, polqual, polwithcheck, polpermissive, polroles FROM pg_policy WHERE oid IN (6620190)');
  console.log('policy:', pol.rows);
  await c.end();
})();
