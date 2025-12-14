import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function run() {
  console.log('Validating FK constraints for companyId')
  const rows = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'companyid' AND table_schema = 'public'`)
  for (const r of rows as any[]) {
    const table = r.table_name
    const cName = `fk_${table}_company`
    try {
      // check constraint existence
      const exists = await prisma.$queryRawUnsafe(`SELECT 1 FROM information_schema.table_constraints WHERE table_schema='public' AND table_name='${table}' AND constraint_name='${cName}'`)
      if (!exists || (exists as any[]).length === 0) {
        console.log(`Constraint ${cName} on ${table} not found; skipping`)
        continue
      }
      console.log(`Validating ${cName} on ${table}`)
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" VALIDATE CONSTRAINT "${cName}"`)
    } catch (err) {
      console.error(`Failed to validate ${cName} on ${table}`, err)
    }
  }
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => { await prisma.$disconnect() })
