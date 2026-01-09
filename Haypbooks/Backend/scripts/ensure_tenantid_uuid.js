const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';
const c = new Client({ connectionString: conn });
const uuidRegex = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
(async () => {
  try {
    await c.connect();
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name='tenantId' AND udt_name <> 'uuid'");
    const tables = Array.from(new Set(res.rows.map(r => r.table_name)));
    console.log('Tables to convert:', tables);
    for (const t of tables) {
      console.log('\n---- Processing', t);
      try {
        await c.query(`ALTER TABLE public."${t}" DISABLE ROW LEVEL SECURITY`);
      } catch (e) {
        console.log('Could not disable RLS (ok):', e.message.split('\n')[0]);
      }
      try {
        await c.query(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS "tenantId_new" uuid`);
        await c.query(`UPDATE public."${t}" SET "tenantId_new" = CASE WHEN "tenantId" ~ '${uuidRegex}' THEN "tenantId"::uuid ELSE gen_random_uuid() END WHERE "tenantId" IS NOT NULL`);
        const cnt = (await c.query(`SELECT COUNT(*) as cnt FROM public."${t}" WHERE "tenantId" IS NOT NULL AND "tenantId_new" IS NULL`)).rows[0].cnt;
        if (parseInt(cnt) === 0) {
          await c.query(`ALTER TABLE public."${t}" ALTER COLUMN "tenantId_new" SET NOT NULL`);
        }
        // remove any previous tenantId_old (cleanup), then swap
        await c.query(`ALTER TABLE public."${t}" DROP COLUMN IF EXISTS "tenantId_old"`);
        await c.query(`ALTER TABLE public."${t}" RENAME COLUMN "tenantId" TO "tenantId_old"`);
        await c.query(`ALTER TABLE public."${t}" RENAME COLUMN "tenantId_new" TO "tenantId"`);
        // drop the old column now that new one exists and is populated
        try { await c.query(`ALTER TABLE public."${t}" DROP COLUMN IF EXISTS "tenantId_old"`); } catch (e) { console.log('Could not drop tenantId_old (ok):', e.message.split('\n')[0]); }
        console.log('Swapped columns for', t);
      } catch (e) {
        console.error('Error converting table', t, e.message.split('\n')[0]);
      }
      try {
        // create FK only if not present
        const fkName = `fk_${t}_tenant`;
        const fkExists = (await c.query(`SELECT 1 FROM pg_constraint WHERE conname = $1`, [fkName])).rowCount > 0;
        if (!fkExists) {
          await c.query(`ALTER TABLE public."${t}" ADD CONSTRAINT "${fkName}" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT NOT VALID`);
          console.log('Added FK (NOT VALID) for', t);
        } else {
          console.log('FK already exists for', t);
        }
      } catch (e) { console.log('FK add failed (ok):', e.message.split('\n')[0]); }
      try {
        await c.query(`ALTER TABLE public."${t}" ENABLE ROW LEVEL SECURITY`);
      } catch (e) { /* ignore */ }
      try {
        await c.query(`CREATE POLICY IF NOT EXISTS tenant_isolation_${t} ON public."${t}" FOR ALL USING (("tenantId")::text = current_setting('hayp.tenant_id')) WITH CHECK (("tenantId")::text = current_setting('hayp.tenant_id'))`);
      } catch(e) { /* ignore */ }
    }
    // Ensure Task has archivedAt column
    try {
      await c.query(`ALTER TABLE public."Task" ADD COLUMN IF NOT EXISTS "archivedAt" timestamptz`);
      console.log('Ensured Task.archivedAt exists');
    } catch(e) { console.error('Could not add Task.archivedAt:', e.message.split('\n')[0]); }

    console.log('\nConversion script completed');
  } catch (e) {
    console.error(e);
  } finally {
    await c.end();
  }
})();