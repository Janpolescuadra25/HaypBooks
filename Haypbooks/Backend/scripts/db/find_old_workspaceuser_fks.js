const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  const q = `
    SELECT pc.conname, c.relname as table, array_agg(pa.attname ORDER BY uk.ordinality) as cols
    FROM pg_constraint pc
    JOIN pg_class c ON pc.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN LATERAL (SELECT unnest(pc.conkey) as attnum, generate_series(1, array_length(pc.conkey,1)) as ordinality) uk ON true
    JOIN pg_attribute pa ON pa.attrelid = c.oid AND pa.attnum = uk.attnum
    WHERE pc.contype = 'f'
      AND pc.confrelid = (SELECT oid FROM pg_class WHERE relname = 'WorkspaceUser' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname='public'))
    GROUP BY pc.conname, c.relname
  `;
  const res = await c.query(q);
  console.log(res.rows);
  await c.end();
})();