#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const DEP_TABLES = [
  'Invoice', 'RecurringInvoice', 'Bill', 'PurchaseOrder', 'Subscription', 'JournalEntry', 'JournalEntryLine', 'StockLocation', 'InventoryTransaction', 'InventoryTransactionLine', 'CustomerCredit', 'CustomerCreditLine', 'VendorCredit', 'VendorCreditLine', 'BillPayment'
]

async function run() {
  console.log('Building duplicate company dependency report...')
  const groups: any[] = await prisma.$queryRaw`
    SELECT c."tenantId", lower(c.name) as lname, array_agg(c.id) as ids
    FROM public."Company" c
    GROUP BY c."tenantId", lower(c.name)
    HAVING count(*) > 1
    ORDER BY c."tenantId";
  `

  if (!groups || groups.length === 0) { console.log('No duplicate company groups found.'); return }

  for (const g of groups) {
    console.log('\n---')
    console.log('Tenant:', g.tenantId, 'name norm:', g.lname)
    const ids: string[] = g.ids
    for (const id of ids) {
      console.log('  Company', id)
      for (const t of DEP_TABLES) {
        try {
          const res: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${t}" WHERE "companyId" = $1`, id)
          const cnt = res && res[0] ? res[0].cnt : 0
          if (cnt > 0) console.log(`    ${t}: ${cnt}`)
        } catch (e) {
          // table might not exist in this DB; ignore
        }
      }
    }
  }
}

run().catch((e)=>{ console.error(e); process.exit(1) }).finally(async ()=>{ await prisma.$disconnect() })