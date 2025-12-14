const { Client } = require('pg')
const fs = require('fs')

async function main(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  await c.connect()
  const tenantTypeRes = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  const tenantType = tenantTypeRes.rows[0] && tenantTypeRes.rows[0].typname
  const res = await c.query("SELECT table_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name")
  const candidates = res.rows.filter(r => r.udt_name === 'uuid' && tenantType === 'text')
  if (!candidates.length) {
    console.log('No uuid->text conversions needed')
    await c.end(); return
  }
  const out = []
  out.push('-- Generated migration: convert tenantId columns from uuid to text (safe copy approach)')
  out.push('-- Review RLS/policies for each table and perform in a maintenance window')
  for (const cnd of candidates) {
    const t = cnd.table_name
    out.push(`-- Table: ${t}`)
    out.push(`DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${t}' AND column_name='tenantId_txt') THEN\n    ALTER TABLE public."${t}" ADD COLUMN "tenantId_txt" text;\n  END IF;\n  UPDATE public."${t}" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;\n  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = '${t.toLowerCase()}_tenantid_txt_idx') THEN\n    CREATE INDEX ${t.toLowerCase()}_tenantid_txt_idx ON public."${t}" ("tenantId_txt");\n  END IF;\n  -- Add FK on tenantId_txt (NOT VALID) to allow adding constraint without full validation immediately\n  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${t}_tenant_txt_fkey') THEN\n    ALTER TABLE public."${t}" ADD CONSTRAINT "${t}_tenant_txt_fkey" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;\n  END IF;\nEND $$;`)
    out.push('')
  }
  const file = 'tmp-convert-tenantid-uuid-to-text.sql'
  fs.writeFileSync(file, out.join('\n'))
  console.log('Wrote', file)
  await c.end()
}

main().catch(e=>{console.error(e);process.exit(1)})
