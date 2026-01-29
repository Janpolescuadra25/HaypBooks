const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node cleanup_workspaceuser_final.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  const ts = new Date().toISOString().replace(/[:.]/g,'_');
  const backups = [
    { tbl: 'WorkspaceUser', b: `backup_WorkspaceUser_precleanup_${ts}` },
    { tbl: 'CompanyUser', b: `backup_CompanyUser_precleanup_${ts}` },
    { tbl: 'PracticeUser', b: `backup_PracticeUser_precleanup_${ts}` },
  ];
  try {
    console.log('Beginning cleanup transaction...');
    await c.query('BEGIN');

    // create backups (full copies)
    for (const {tbl,b} of backups) {
      console.log(`Creating backup table ${b} AS SELECT * FROM public."${tbl}"`);
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

    // Drop old constraints referencing tenantId_old
    console.log('Dropping old fk constraints referencing tenantId_old (if exist)');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey"');

    // Drop helper constraints referencing tenantid_new
    console.log('Dropping helper _fkey_new constraints (if exist)');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey_new"');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey_new"');

    // Add final constraints referencing canonical tenantId
    console.log('Adding final constraints referencing canonical tenantId');
    await c.query('ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');
    await c.query('ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES public."WorkspaceUser" ("tenantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE');

    // Drop old text columns
    console.log('Dropping old columns tenantId_old and helper cols tenantid_new');
    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS "tenantId_old"');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS "tenantId_old"');

    // Drop helper tenantid_new columns if you want to rely solely on canonical tenantId
    await c.query('ALTER TABLE public."WorkspaceUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."CompanyUser" DROP COLUMN IF EXISTS tenantid_new');
    await c.query('ALTER TABLE public."PracticeUser" DROP COLUMN IF EXISTS tenantid_new');

    await c.query('COMMIT');
    console.log('Cleanup committed successfully. Backups created:');
    backups.forEach(b => console.log('  -', b.b));
  } catch (err) {
    console.error('Error during cleanup, rolling back:', err.message);
    try { await c.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
