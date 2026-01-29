const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node cleanup_workspaceuser_final_v5.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const ts = new Date().toISOString().replace(/[:.]/g,'_');
  const backups = [
    { tbl: 'WorkspaceUser', b: `backup_WorkspaceUser_precleanup_${ts}` },
    { tbl: 'CompanyUser', b: `backup_CompanyUser_precleanup_${ts}` },
    { tbl: 'PracticeUser', b: `backup_PracticeUser_precleanup_${ts}` },
  ];
  try {
    console.log('Beginning v5 cleanup transaction...');
    await c.query('BEGIN');

    for (const {tbl,b} of backups) {
      console.log(`Creating backup table ${b}`);
      await c.query(`DROP TABLE IF EXISTS public."${b}"`);
      await c.query(`CREATE TABLE public."${b}" AS TABLE public."${tbl}"`);
    }

    console.log('Populating canonical tenantId from tenantid_new where needed');
    await c.query('UPDATE public."WorkspaceUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');
    await c.query('UPDATE public."CompanyUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');
    await c.query('UPDATE public."PracticeUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');

    // Ensure index on canonical tenantId exists to support PK/FKs
    await c.query('CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_tenant_user_unique_tenantId" ON public."WorkspaceUser" ("tenantId", "userId")');

    // Drop old referencing FKs on CompanyUser/PracticeUser
    console.log('Dropping any old composite FKs on CompanyUser/PracticeUser');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey"');

    // Drop primary keys for CompanyUser/PracticeUser before removing indexes that depend on them
    console.log('Dropping primary key constraints on CompanyUser and PracticeUser');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_pkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_pkey"');

    // Drop indexes on CompanyUser/PracticeUser referencing tenantId_old
    console.log('Dropping CompanyUser/PracticeUser indexes that reference tenantId_old');
    const r1 = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='CompanyUser' AND indexdef ILIKE '%tenantId_old%'`);
    for (const row of r1.rows) { await c.query(`DROP INDEX IF EXISTS public."${row.indexname}"`); console.log('Dropped', row.indexname); }
    const r2 = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='PracticeUser' AND indexdef ILIKE '%tenantId_old%'`);
    for (const row of r2.rows) { await c.query(`DROP INDEX IF EXISTS public."${row.indexname}"`); console.log('Dropped', row.indexname); }

    // On WorkspaceUser: drop primary key first (it may reference tenantId_old), then drop indexes referencing tenantId_old
    console.log('Dropping primary key WorkspaceUser_pkey (old) if exists');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_pkey"');

    console.log('Dropping WorkspaceUser indexes that reference tenantId_old');
    const r3 = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='WorkspaceUser' AND indexdef ILIKE '%tenantId_old%'`);
    for (const row of r3.rows) { await c.query(`DROP INDEX IF EXISTS public."${row.indexname}"`); console.log('Dropped', row.indexname); }

    // Drop foreign key from WorkspaceUser to Tenant that references tenantId_old
    console.log('Dropping FK WorkspaceUser_tenantId_fkey if exists');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_tenantId_fkey"');

    // Drop NOT NULL constraint on tenantId_old
    console.log('Dropping NOT NULL constraint on tenantId_old (if exists)');
    await c.query('ALTER TABLE public."WorkspaceUser" ALTER COLUMN "tenantId_old" DROP NOT NULL');

    // Drop NOT NULL constraint on tenantId_old
    console.log('Dropping NOT NULL constraint on tenantId_old (if exists)');
    await c.query('ALTER TABLE public."WorkspaceUser" ALTER COLUMN "tenantId_old" DROP NOT NULL');

    // Recreate primary key on canonical tenantId,userId (only add if missing)
    console.log('Adding primary key on (tenantId, userId)');
    const wk = await c.query("SELECT 1 FROM pg_constraint WHERE conname='WorkspaceUser_pkey'");
    if (wk.rowCount === 0) {
      await c.query('ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("tenantId", "userId")');
    }

    // Recreate PKs for CompanyUser and PracticeUser to use tenantId (companyId/tenantId/userId and practiceId/tenantId/userId)
    console.log('Recreating CompanyUser and PracticeUser primary keys to use tenantId');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_pkey"');
    const c1 = await c.query("SELECT 1 FROM pg_constraint WHERE conname='CompanyUser_pkey'");
    if (c1.rowCount === 0) {
      await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("companyId", "tenantId", "userId")');
    }
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_pkey"');
    const c2 = await c.query("SELECT 1 FROM pg_constraint WHERE conname='PracticeUser_pkey'");
    if (c2.rowCount === 0) {
      await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_pkey" PRIMARY KEY ("practiceId", "tenantId", "userId")');
    }

    // Recreate final FKs (only add if missing)
    const cfk = await c.query("SELECT 1 FROM pg_constraint WHERE conname='CompanyUser_tenantId_userId_fkey'");
    if (cfk.rowCount === 0) {
      await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');
    }
    const pfk = await c.query("SELECT 1 FROM pg_constraint WHERE conname='PracticeUser_tenantId_userId_fkey'");
    if (pfk.rowCount === 0) {
      await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');
    }

    // DISCLAIMER: Adding FK to Tenant(id) is deferred because Tenant.id is currently type text.
    // When Tenant.id has been converted to UUID, add the FK:
    //   ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

    // Recreate tenant isolation RLS policy to reference tenantId
    console.log('Updating tenant isolation policy for WorkspaceUser to use tenantId');
    await c.query('DROP POLICY IF EXISTS "tenant_isolation_WorkspaceUser" ON public."WorkspaceUser"');
    await c.query(`CREATE POLICY "tenant_isolation_WorkspaceUser" ON public."WorkspaceUser" USING ("tenantId" = current_setting('hayp.tenant_id')::uuid) WITH CHECK ("tenantId" = current_setting('hayp.tenant_id')::uuid)`);

    // Finally drop old columns now that all dependents are updated
    console.log('Dropping old columns tenantId_old and helper cols tenantid_new');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS "tenantId_old"');

    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS tenantid_new');

    await c.query('COMMIT');
    console.log('Cleanup v5 committed successfully. Backups created:');
    backups.forEach(b => console.log('  -', b.b));
  } catch (err) {
    console.error('Error during cleanup v5, rolling back:', err.message);
    try { await c.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
