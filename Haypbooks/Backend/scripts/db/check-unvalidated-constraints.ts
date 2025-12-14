import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT nspname, relname AS table_name, conname, convalidated
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND c.contype = 'f' -- and is foreign-key
      AND c.convalidated = false
    ORDER BY table_name, conname
  `)

  if ((rows as any[]).length === 0) {
    console.log('No unvalidated FOREIGN KEY constraints found')
    process.exit(0)
  }

  console.log('Unvalidated FOREIGN KEY constraints:')
  for (const r of rows as any[]) {
    console.log(`- table=${r.table_name} constraint=${r.conname} validated=${r.convalidated}`)
  }

  const strict = (process.env.STRICT_CONSTRAINT_VALIDATION || '').toLowerCase() === 'true'
  if (strict) {
    console.error('Strict mode enabled: failing due to unvalidated constraints')
    process.exit(2)
  }
  process.exit(0)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => { await prisma.$disconnect() })
