const { Client } = require('pg');
(async ()=>{
  const c = new Client({ connectionString: process.argv[2] });
  await c.connect();
  console.log('Searching pg_indexes...');
  const idx = await c.query(`SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE indexdef ILIKE '%tenantid_old%' OR indexdef ILIKE '%"tenantId_old"%'`);
  console.log('indexes:', idx.rows);
  console.log('\nSearching views...');
  const vw = await c.query(`SELECT table_schema, table_name, view_definition FROM information_schema.views WHERE view_definition ILIKE '%tenantId_old%'`);
  console.log('views:', vw.rows);
  console.log('\nSearching functions... (pg_proc)');
  const fn = await c.query(`SELECT proname, pg_get_functiondef(p.oid) as def FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE pg_get_functiondef(p.oid) ILIKE '%tenantId_old%'`);
  console.log('functions:', fn.rows.map(r=>({name:r.proname, def: r.def.slice(0,200)})));
  console.log('\nSearching constraints referencing WorkspaceUser (detailed)');
  const cons = await c.query(`SELECT pc.conname, c.relname as table, array_agg(refa.attname ORDER BY s.ordinality) as referenced_cols
FROM pg_constraint pc
JOIN pg_class c ON pc.conrelid = c.oid
JOIN LATERAL unnest(pc.conkey) WITH ORDINALITY AS s(attnum, ord) ON true
JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = s.attnum
JOIN LATERAL unnest(pc.confkey) WITH ORDINALITY AS t(attnum, ord) ON t.ordinality = s.ordinality
JOIN pg_attribute refa ON refa.attrelid = pc.confrelid AND refa.attnum = t.attnum
WHERE pc.contype = 'f' AND pc.confrelid = 'WorkspaceUser'::regclass
GROUP BY pc.conname, c.relname`);
  console.log('fk refs to WorkspaceUser:', cons.rows);
  await c.end();
})();
