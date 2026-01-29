const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  const table = process.argv[3];
  if (!conn || !table) { console.error('Usage: node cleanup_table_tenantid_old.js <conn> <TableName>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const ts = new Date().toISOString().replace(/[:.]/g,'_');
  const backup = `backup_${table}_precleanup_${ts}`;
  try {
    console.log(`Processing table ${table}`);
    await c.query('BEGIN');
    console.log('Creating backup', backup);
    await c.query(`DROP TABLE IF EXISTS public."${backup}"`);
    await c.query(`CREATE TABLE public."${backup}" AS TABLE public."${table}"`);

    // Drop primary key constraint if it references tenantId_old (do this first to allow NOT NULL to be removed)
    console.log('Dropping primary key constraint(s) that reference tenantId_old (if any)');
    const pks = await c.query(`
      SELECT pc.conname
      FROM pg_constraint pc
      JOIN pg_class c ON pc.conrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      JOIN LATERAL (SELECT unnest(pc.conkey) as attnum) ck ON true
      JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
      WHERE pc.contype = 'p' AND c.relname = $1 AND pa.attname = 'tenantId_old'
    `, [table]);
    for (const r of pks.rows) { console.log('Dropping PK constraint', r.conname); await c.query(`ALTER TABLE public."${table}" DROP CONSTRAINT IF EXISTS "${r.conname}"`); }

    console.log('Dropping FK constraints that directly reference tenantId_old (if any)');
    // Drop tenant isolation policy for table (if exists) and re-create after using tenantId
    const policyName = `tenant_isolation_${table}`;
    console.log('Dropping RLS policy if exists:', policyName);
    await c.query(`DROP POLICY IF EXISTS "${policyName}" ON public."${table}"`);

    // Find FK constraint names that reference tenantId_old and drop them
    const fks = await c.query(`
      SELECT pc.conname
      FROM pg_constraint pc
      JOIN pg_class c ON pc.conrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      JOIN LATERAL (SELECT unnest(pc.conkey) as attnum) ck ON true
      JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
      WHERE pc.contype = 'f' AND c.relname = $1 AND pa.attname = 'tenantId_old'
    `, [table]);
    for (const r of fks.rows) {
      console.log('Dropping FK constraint', r.conname);
      await c.query(`ALTER TABLE public."${table}" DROP CONSTRAINT IF EXISTS "${r.conname}"`);
    }

    console.log('Dropping NOT NULL constraints on tenantId_old (if any)');
    // Remove NOT NULL if exists
    try { await c.query(`ALTER TABLE public."${table}" ALTER COLUMN "tenantId_old" DROP NOT NULL`); } catch(e) { console.log('No NOT NULL or other issue:', e.message); }


    console.log('Dropping any indexes on the table that reference tenantId_old');
    const idxs = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename=$1 AND indexdef ILIKE '%tenantId_old%'`, [table]);
    for (const r of idxs.rows) { console.log('Dropping index', r.indexname); await c.query(`DROP INDEX IF EXISTS public."${r.indexname}"`); }

    console.log('Finally dropping tenantId_old and tenantid_new columns (if exist)');
    await c.query(`ALTER TABLE public."${table}" DROP COLUMN IF EXISTS "tenantId_old"`);
    await c.query(`ALTER TABLE public."${table}" DROP COLUMN IF EXISTS tenantid_new`);

    await c.query('COMMIT');
    console.log(`Cleanup for ${table} completed; backup table ${backup} created.`);
  } catch (err) {
    console.error('Error operating on', table, ':', err.message);
    try { await c.query('ROLLBACK'); } catch(e) { console.error('Rollback failed:', e.message); }
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
