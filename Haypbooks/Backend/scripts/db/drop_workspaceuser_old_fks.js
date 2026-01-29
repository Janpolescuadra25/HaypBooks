const { Client } = require('pg');
(async ()=>{
  const conn = process.argv[2];
  if (!conn) { console.error('Usage: node drop_workspaceuser_old_fks.js <connection-string>'); process.exit(2); }
  const c = new Client({ connectionString: conn });
  await c.connect();
  try {
    console.log('Dropping CompanyUser_tenantId_userId_fkey (if exists)');
    await c.query('ALTER TABLE public."CompanyUser" DROP CONSTRAINT IF EXISTS "CompanyUser_tenantId_userId_fkey"');
    console.log('Dropping PracticeUser_tenantId_userId_fkey (if exists)');
    await c.query('ALTER TABLE public."PracticeUser" DROP CONSTRAINT IF EXISTS "PracticeUser_tenantId_userId_fkey"');
    console.log('Done');
  } catch (err) {
    console.error('Error dropping old fks:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
})();
