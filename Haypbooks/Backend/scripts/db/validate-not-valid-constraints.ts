import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function run() {
  console.log('Finding NOT VALID constraints to validate')
  // Find constraint names where NOT VALID (convalidated is false)
  const rows = await prisma.$queryRawUnsafe(`
    SELECT nspname, relname AS table_name, conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND c.convalidated = false
  `)

  for (const r of rows as any[]) {
    const table = r.table_name
    const name = r.conname
    try {
      console.log(`Validating constraint ${name} on ${table}`)
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" VALIDATE CONSTRAINT "${name}"`)
    } catch (err) {
      console.error(`Failed to validate ${name} on ${table}`, err)
      // continue for resilience and manual investigation
    }
  }
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => { await prisma.$disconnect() })
