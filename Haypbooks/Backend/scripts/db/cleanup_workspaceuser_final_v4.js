const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node cleanup_workspaceuser_final_v4.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const ts = new Date().toISOString().replace(/[:.]/g,'_');
  const backups = [
    { tbl: 'WorkspaceUser', b: `backup_WorkspaceUser_precleanup_${ts}` },
    { tbl: 'CompanyUser', b: `backup_CompanyUser_precleanup_${ts}` },
    { tbl: 'PracticeUser', b: `backup_PracticeUser_precleanup_${ts}` },
  ];
  try {
    console.log('Beginning v4 cleanup transaction...');
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

    await c.query('CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_tenant_user_unique_tenantId" ON public."WorkspaceUser" ("tenantId", "userId")');

    // Drop tenant isolation policy on WorkspaceUser and recreate to reference tenantId instead
    console.log('Recreating RLS policy tenant_isolation_WorkspaceUser to reference tenantId');
    await c.query('DROP POLICY IF EXISTS "tenant_isolation_WorkspaceUser" ON public."WorkspaceUser"');
    await c.query(`CREATE POLICY "tenant_isolation_WorkspaceUser" ON public."WorkspaceUser" USING ("tenantId" = current_setting('hayp.tenant_id')::uuid) WITH CHECK ("tenantId" = current_setting('hayp.tenant_id')::uuid)`);

    // Drop constraints that explicitly reference tenantId_old on WorkspaceUser
    console.log('Dropping NOT NULL / FK / PK constraints referencing tenantId_old on WorkspaceUser');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_tenantId_not_null"');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_tenantId_fkey"');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_pkey"');

    // Recreate WorkspaceUser PK on canonical tenantId if missing
    await c.query('ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT IF NOT EXISTS "WorkspaceUser_pkey" PRIMARY KEY ("tenantId", "userId")');

    // Drop old FKs on referencing tables (safety) then recreate final FKs
    console.log('Dropping old refs and creating final FKs on CompanyUser/PracticeUser');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey"');

    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey_new"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey_new"');

    await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT IF NOT EXISTS "CompanyUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');
    await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT IF NOT EXISTS "PracticeUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');

    // Drop any remaining indexes on these tables that reference tenantId_old
    console.log('Dropping indexes referencing tenantId_old on WorkspaceUser/CompanyUser/PracticeUser');
    const tables = ['WorkspaceUser','CompanyUser','PracticeUser'];
    for (const t of tables) {
      const res = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename=$1 AND indexdef ILIKE '%tenantId_old%'`, [t]);
      for (const r of res.rows) {
        console.log(`Dropping index ${r.indexname}`);
        await c.query(`DROP INDEX IF EXISTS public."${r.indexname}"`);
      }
    }

    // Finally drop old columns
    console.log('Dropping old columns tenantId_old and helper tenantid_new');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS "tenantId_old"');

    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS tenantid_new');

    // Recreate FK on WorkspaceUser (tenantId -> Tenant.id)
    console.log('Adding FK WorkspaceUser_tenantId_fkey referencing Tenant(id) on canonical tenantId');
    await c.query('ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT IF NOT EXISTS "WorkspaceUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT');

    await c.query('COMMIT');
    console.log('Cleanup v4 committed successfully. Backups created:');
    backups.forEach(b => console.log('  -', b.b));
  } catch (err) {
    console.error('Error during cleanup v4, rolling back:', err.message);
    try { await c.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
