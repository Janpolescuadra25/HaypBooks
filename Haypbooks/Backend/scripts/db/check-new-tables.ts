import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function run() {
  const tables = [
    'ContactEmail',
    'ContactPhone',
    'CustomerCredit',
    'CustomerCreditLine',
    'CustomerCreditApplication'
  ]

  for (const t of tables) {
    const r: any[] = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = '${t}'`)
    console.log(t, (r && r.length > 0) ? 'exists' : 'missing')
  }

  // check columns
  const colChecks = [
    { table: 'Invoice', column: 'journalEntryId' },
    { table: 'Bill', column: 'journalEntryId' },
    { table: 'PaymentReceived', column: 'journalEntryId' },
    { table: 'BillPayment', column: 'journalEntryId' },
    { table: 'InventoryTransaction', column: 'journalEntryId' }
  ]

  for (const c of colChecks) {
    const r: any[] = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${c.table}' AND column_name='${c.column}'`)
    console.log(`${c.table}.${c.column}`, r.length > 0 ? 'exists' : 'missing')
  }
}

run()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(async () => { await prisma.$disconnect() })
