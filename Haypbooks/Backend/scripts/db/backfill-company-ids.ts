import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

// List of tenant-scoped tables that have companyId and should be backfilled when NULL
const TABLES = [
  'Invoice', 'InvoiceLine', 'Bill', 'BillLine', 'PurchaseOrder', 'PurchaseOrderLine',
  'VendorCredit', 'VendorCreditLine', 'BillPayment', 'VendorPaymentMethod',
  'StockLocation', 'StockLevel', 'InventoryTransaction', 'InventoryTransactionLine', 'InventoryCostLayer',
  'JournalEntry', 'JournalEntryLine'
]

async function run() {
  console.log('Starting companyId backfill...')
  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } })
  for (const tenant of tenants) {
    console.log(`Processing tenant ${tenant.id} (${tenant.name})`)
    // Ensure a default company exists for the tenant
    const defaultCompanyId = `company-${tenant.id}`
    const company = await prisma.company.upsert({
      where: { id: defaultCompanyId },
      update: {},
      create: { id: defaultCompanyId, tenantId: tenant.id, name: 'Default Company' }
    })
    console.log(`  default company id: ${company.id}`)

    // For each table, update rows where companyId is NULL for this tenant
    for (const table of TABLES) {
      try {
        // Only update tables that actually exist in schema
        const exists = await prisma.$queryRawUnsafe(`SELECT to_regclass('public.${table}') IS NOT NULL as exists`) as any[]
        if (!exists || !exists[0] || !exists[0].exists) {
          continue
        }
        const sql = `UPDATE "${table}" SET "companyId" = $1 WHERE "tenantId" = $2 AND "companyId" IS NULL`
        const res = await prisma.$executeRawUnsafe(sql.replace('$1', `'${company.id}'`).replace('$2', `'${tenant.id}'`))
        console.log(`  ${table}: backfilled rows for tenant ${tenant.id}`)
      } catch (err) {
        console.error(`  ${table}: failed to backfill for tenant ${tenant.id}`, err)
      }
    }

    console.log(`Finished tenant ${tenant.id}`)
  }

  console.log('Backfill complete. Note: FK constraints were created NOT VALID; run the validation step in a maintenance window to enforce them.')
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
