import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const tables = [
  'Invoice',
  'InvoiceLine',
  'PaymentReceived',
  'Bill',
  'BankAccount',
  'BankTransaction',
  'RecurringInvoice',
  'CustomerCredit',
  'CustomerCreditLine',
  'Vendor',
  'Customer',
  'Item',
  'StockLevel',
  'AccountingEntry'
]

async function run() {
  console.info('[ORPHANS] scanning tables for tenantId IS NULL')
  for (const t of tables) {
    try {
      const tableCandidates = [t, t.toLowerCase(), t.toLowerCase() + 's', t.replace(/([A-Z])/g, '_$1').toLowerCase(), t.replace(/([A-Z])/g, '_$1').toLowerCase() + 's']
      let found = false
      for (const tc of tableCandidates) {
        try {
          const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${tc}" WHERE "tenantId" IS NULL`)
          if (res && res[0]) {
            const cnt = res[0].cnt
            if (cnt > 0) {
              console.info(`[ORPHANS] ${t} (resolved ${tc}) has ${cnt} rows with tenantId IS NULL`) 
              const sample = await prisma.$queryRawUnsafe(`SELECT id, * FROM public."${tc}" WHERE "tenantId" IS NULL LIMIT 10`)
              console.info(`[ORPHANS] Sample rows for ${tc}:`, sample)
            }
            found = true
            break
          }
        } catch (_e) {
          // not found, try next variant
        }
      }
      if (!found) {
        console.warn(`[ORPHANS] table ${t} not found in DB (check naming)`)
      }
    } catch (err) {
      console.warn('[ORPHANS] Error scanning', t, err.message || err)
    }
  }
  console.info('[ORPHANS] complete')
}

run().catch((e)=> console.error(e)).finally(async ()=> await prisma.$disconnect())