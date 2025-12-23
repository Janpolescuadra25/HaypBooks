const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev' });
  await client.connect();
  try {
    console.log('Ensuring pgcrypto extension exists...');
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    // 1. Drop foreign keys referencing Tenant
    console.log('Dropping foreign keys referencing Tenant...');
    const fkRes = await client.query("SELECT conname, conrelid::regclass::text AS tablename FROM pg_constraint WHERE confrelid = 'public.\"Tenant\"'::regclass AND contype = 'f'");
    for (const r of fkRes.rows) {
      try {
        console.log(`Dropping constraint ${r.conname} on ${r.tablename}`);
        await client.query(`ALTER TABLE ${r.tablename} DROP CONSTRAINT IF EXISTS "${r.conname}"`);
      } catch (e) {
        console.error(`Failed to drop ${r.conname}:`, e.message);
      }
    }

    // 2. Convert Tenant.id to uuid (if not uuid)
    const tenantIdType = (await client.query("SELECT udt_name FROM information_schema.columns WHERE table_name='Tenant' AND column_name='id'")).rows[0].udt_name;
    if (tenantIdType !== 'uuid') {
      console.log('Converting Tenant.id to uuid...');
      await client.query('ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS id_new uuid');
      await client.query("UPDATE public.\"Tenant\" SET id_new = CASE WHEN id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN id::uuid ELSE gen_random_uuid() END WHERE id IS NOT NULL");
      const nullCount = (await client.query("SELECT COUNT(*) as c FROM public.\"Tenant\" WHERE id_new IS NULL")).rows[0].c;
      if (Number(nullCount) === 0) {
        await client.query('ALTER TABLE public."Tenant" ALTER COLUMN id_new SET NOT NULL');
      }
      await client.query('ALTER TABLE public."Tenant" DROP CONSTRAINT IF EXISTS "Tenant_pkey"');
      await client.query('ALTER TABLE public."Tenant" RENAME COLUMN id TO id_old');
      await client.query('ALTER TABLE public."Tenant" RENAME COLUMN id_new TO id');
      await client.query('ALTER TABLE public."Tenant" ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id)');
      console.log('Tenant.id converted to uuid');
    } else {
      console.log('Tenant.id already uuid; skipping conversion');
    }

    // 3. Convert tenantId columns across public schema where needed
    console.log('Converting tenantId columns to uuid where necessary...');
    const cols = await client.query("SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId' AND udt_name <> 'uuid'");
    for (const t of cols.rows) {
      const tbl = `${t.table_schema}."${t.table_name}"`;
      console.log('Processing', tbl);
      try {
        await client.query(`ALTER TABLE ${tbl} ADD COLUMN IF NOT EXISTS "tenantId_new" uuid`);
        await client.query(`UPDATE ${tbl} SET "tenantId_new" = CASE WHEN "tenantId" ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN "tenantId"::uuid ELSE gen_random_uuid() END WHERE "tenantId" IS NOT NULL`);
        const nulls = (await client.query(`SELECT COUNT(*) as c FROM ${tbl} WHERE "tenantId" IS NOT NULL AND "tenantId_new" IS NULL`)).rows[0].c;
        if (Number(nulls) === 0) {
          await client.query(`ALTER TABLE ${tbl} ALTER COLUMN "tenantId_new" SET NOT NULL`);
        }
        await client.query(`ALTER TABLE ${tbl} DROP COLUMN IF EXISTS "tenantId_old"`);
        await client.query(`ALTER TABLE ${tbl} RENAME COLUMN "tenantId" TO "tenantId_old"`);
        await client.query(`ALTER TABLE ${tbl} RENAME COLUMN "tenantId_new" TO "tenantId"`);
        console.log(`Converted tenantId for ${tbl}`);
      } catch (e) {
        console.warn(`Skipping conversion of ${tbl} due to error: ${e.message}`);
      }
    }

    // 4. Re-add tenant foreign keys as NOT VALID
    console.log('Recreating tenant foreign keys as NOT VALID...');
    const tablesWithTenant = await client.query("SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name = 'tenantId'");
    for (const t of tablesWithTenant.rows) {
      const tbl = `${t.table_schema}."${t.table_name}"`;
      const cname = `fk_${t.table_name}_tenant`;
      try {
        await client.query(`ALTER TABLE ${tbl} ADD CONSTRAINT "${cname}" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT NOT VALID`);
      } catch (e) {
        // ignore
      }
    }

    console.log('Tenant ID conversion complete');
  } catch (e) {
    console.error('Error in conversion script:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})().catch(e => { console.error(e); process.exit(1) });