const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  const oids = process.argv[3] ? process.argv[3].split(',').map(Number) : [];
  if (!conn || oids.length === 0) { console.error('Usage: node describe_constraints_by_oids.js <conn> <oid1,oid2,...>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const res = await c.query(`SELECT oid, conname, contype, conrelid::regclass::text as tbl, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE oid = ANY($1::oid[])`, [oids]);
  console.log(res.rows);
  await c.end();
})();
