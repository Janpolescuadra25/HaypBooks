const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node cleanup_workspaceuser_final_v2.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const ts = new Date().toISOString().replace(/[:.]/g,'_');
  const backups = [
    { tbl: 'WorkspaceUser', b: `backup_WorkspaceUser_precleanup_${ts}` },
    { tbl: 'CompanyUser', b: `backup_CompanyUser_precleanup_${ts}` },
    { tbl: 'PracticeUser', b: `backup_PracticeUser_precleanup_${ts}` },
  ];
  try {
    console.log('Beginning v2 cleanup transaction...');
    await c.query('BEGIN');

    // create backups (full copies)
    for (const {tbl,b} of backups) {
      console.log(`Creating backup table ${b}`);
      await c.query(`DROP TABLE IF EXISTS public."${b}"`);
      await c.query(`CREATE TABLE public."${b}" AS TABLE public."${tbl}"`);
    }

    // Populate canonical tenantId from tenantid_new where missing
    console.log('Populating canonical tenantId from tenantid_new where needed');
    await c.query('UPDATE public."WorkspaceUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');
    await c.query('UPDATE public."CompanyUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');
    await c.query('UPDATE public."PracticeUser" SET "tenantId" = tenantid_new WHERE tenantid_new IS NOT NULL AND "tenantId" IS NULL');

    // Ensure unique index exists on canonical tenantId,userId
    console.log('Creating unique index on public."WorkspaceUser" (tenantId, userId) if missing');
    await c.query('CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_tenant_user_unique_tenantId" ON public."WorkspaceUser" ("tenantId", "userId")');

    // Drop old foreign keys referencing WorkspaceUser that use tenantId_old
    console.log('Dropping any foreign keys that reference WorkspaceUser(tenantId_old, userId)');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey"');

    // Drop PKs (which reference tenantId_old) and recreate them using canonical tenantId
    console.log('Dropping and recreating primary keys to use canonical tenantId');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP CONSTRAINT IF EXISTS "WorkspaceUser_pkey"');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_pkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_pkey"');

    // Recreate PKs using tenantId
    await c.query('ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("tenantId", "userId")');
    await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("companyId", "tenantId", "userId")');
    await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_pkey" PRIMARY KEY ("practiceId", "tenantId", "userId")');

    // Drop helper constraints referencing tenantid_new if present
    console.log('Dropping helper _fkey_new constraints');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey_new"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey_new"');

    // Add final constraints referencing canonical tenantId (these will use the new PKs on WorkspaceUser)
    console.log('Adding final FK constraints referencing canonical tenantId');
    await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');
    await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');

    // Drop old columns now that dependencies are removed
    console.log('Dropping old columns tenantId_old and helper cols tenantid_new');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS "tenantId_old"');

    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS tenantid_new');

    await c.query('COMMIT');
    console.log('Cleanup v2 committed successfully. Backups created:');
    backups.forEach(b => console.log('  -', b.b));
  } catch (err) {
    console.error('Error during cleanup v2, rolling back:', err.message);
    try { await c.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
