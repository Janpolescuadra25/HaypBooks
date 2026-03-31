#!/usr/bin/env node
const { Client } = require('pg')
;(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: cs })
  await client.connect()
  try {
    const tenantUserExists = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'TenantUser'
    `);
    if (tenantUserExists.rowCount === 0) {
      console.log('TenantUser table does not exist; skipping trigger creation');
      return;
    }

    const funcSql = `
CREATE OR REPLACE FUNCTION public.set_tenantid_old_if_null() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (NEW."tenantId_old" IS NULL) THEN
    NEW."tenantId_old" := NEW."tenantId";
  END IF;
  RETURN NEW;
END;
$$;`;
    await client.query(funcSql)
    console.log('Created/updated function set_tenantid_old_if_null')
    const trigSql = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tenantuser_set_tenantid_old_trg') THEN
    CREATE TRIGGER tenantuser_set_tenantid_old_trg BEFORE INSERT ON public."TenantUser" FOR EACH ROW EXECUTE FUNCTION public.set_tenantid_old_if_null();
  END IF;
END $$;
`;
    await client.query(trigSql)
    console.log('Created trigger tenantuser_set_tenantid_old_trg (idempotent)')
  } catch (e) {
    console.error('Error creating trigger:', e.message || e)
    process.exit(1)
  } finally {
    await client.end()
  }
})().catch(e=>{ console.error(e); process.exit(1) })
