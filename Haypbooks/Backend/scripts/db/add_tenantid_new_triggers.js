#!/usr/bin/env node
const { Client } = require('pg')
;(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: cs })
  await client.connect()
  try {
    const funcSql = `
CREATE OR REPLACE FUNCTION public.set_tenantid_new_if_null() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (NEW."tenantId_new" IS NULL) THEN
    IF (NEW."tenantId" IS NOT NULL AND NEW."tenantId" ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') THEN
      NEW."tenantId_new" := NEW."tenantId"::uuid;
    ELSE
      NEW."tenantId_new" := gen_random_uuid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;`;
    await client.query(funcSql)
    console.log('Created/updated function set_tenantid_new_if_null')

    const res = await client.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId_new'")
    for (const row of res.rows) {
      const table = row.table_name
      const trigName = `${table.toLowerCase()}_set_tenantid_new_trg`
      const trigSql = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = '${trigName}') THEN
    EXECUTE format('CREATE TRIGGER %I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_tenantid_new_if_null();', '${trigName}', '${table}');
  END IF;
END $$;
`;
      await client.query(trigSql)
      console.log(`Created trigger ${trigName} on table ${table} (idempotent)`)
    }
  } catch (e) {
    console.error('Error creating tenantId_new triggers:', e.message || e)
    process.exit(1)
  } finally {
    await client.end()
  }
})().catch(e=>{ console.error(e); process.exit(1) })
