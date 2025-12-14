import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

const MAX_VALIDATIONS_PER_RUN = Number(process.env.MAX_VALIDATIONS || 10)
const DRY_RUN = (process.env.DRY_RUN || '').toLowerCase() === 'true'

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT nspname, relname AS table_name, conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND c.contype = 'f' AND c.convalidated = false
    ORDER BY relname, conname
    LIMIT ${MAX_VALIDATIONS_PER_RUN}
  `)

  if ((rows as any[]).length === 0) {
    console.log('No unvalidated constraints found; nothing to validate')
    process.exit(0)
  }

  console.log(`Found ${rows.length} unvalidated constraints to process (limit ${MAX_VALIDATIONS_PER_RUN})`)

  for (const r of rows as any[]) {
    const table = r.table_name
    const name = r.conname
    console.log(`Processing: table=${table} constraint=${name}`)
    if (DRY_RUN) continue
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" VALIDATE CONSTRAINT "${name}"`)
      console.log(`Validated ${name}`)
    } catch (err) {
      console.error(`Failed to validate ${name} on ${table}:`, err.message || err)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => { await prisma.$disconnect() })
