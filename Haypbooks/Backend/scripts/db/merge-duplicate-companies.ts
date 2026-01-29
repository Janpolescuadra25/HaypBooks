#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const DEP_TABLES = [
  'Invoice', 'RecurringInvoice', 'Bill', 'PurchaseOrder', 'Subscription', 'JournalEntry', 'JournalEntryLine', 'StockLocation', 'InventoryTransaction', 'InventoryTransactionLine', 'CustomerCredit', 'CustomerCreditLine', 'VendorCredit', 'VendorCreditLine', 'BillPayment'
]

async function run(dryRun = true) {
  console.log(`Scanning duplicate companies and planning merges (dryRun=${dryRun})...`)
  const groups: any[] = await prisma.$queryRaw`
    SELECT c."tenantId", lower(c.name) as lname, json_agg(json_build_object('id', c.id, 'name', c.name, 'createdAt', c."createdAt") ORDER BY c."createdAt") as companies
    FROM public."Company" c
    GROUP BY c."tenantId", lower(c.name)
    HAVING count(*) > 1
    ORDER BY c."tenantId";
  `

  if (!groups || groups.length === 0) { console.log('No duplicate groups found.'); return }

  for (const g of groups) {
    console.log('\n---')
    console.log('Tenant:', g.tenantId, 'name norm:', g.lname)
    const comps = g.companies as any[]
    // For each company check dependent counts
    let safeToMerge = true
    const counts: Record<string, Record<string, number>> = {}
    for (const c of comps) {
      counts[c.id] = {}
      for (const t of DEP_TABLES) {
        try {
          const res: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${t}" WHERE "companyId" = $1`, c.id)
          const cnt = res && res[0] ? res[0].cnt : 0
          counts[c.id][t] = cnt
          if (cnt > 0) safeToMerge = false
        } catch (e) {
          counts[c.id][t] = -1
        }
      }
    }

    if (!safeToMerge) {
      console.log('  Cannot auto-merge this group - dependent data found. Details:')
      for (const c of comps) {
        console.log('  Company', c.id, c.name)
        for (const t of DEP_TABLES) {
          const v = counts[c.id][t]
          if (v && v > 0) console.log(`    ${t}: ${v}`)
        }
      }
      continue
    }

    // safe to merge: keep the earliest createdAt, delete others
    const sorted = comps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const primary = sorted[0]
    const toDelete = sorted.slice(1)
    console.log('  Will keep:', primary.id, primary.name)
    console.log('  Will delete:', toDelete.map((d) => d.id).join(', '))

    if (dryRun) continue

    // perform deletion and decrement tenant.companiesCreated
    const deleteIds = toDelete.map((d) => d.id)
    await prisma.$transaction(async (pr) => {
      // delete duplicate company rows
      await pr.company.deleteMany({ where: { id: { in: deleteIds } } })
      // decrement companiesCreated by number deleted; use group's tenantId
      await pr.tenant.update({ where: { id: g.workspaceId }, data: { companiesCreated: { decrement: deleteIds.length } } })
    })

    console.log('  Deleted duplicates and adjusted tenant counter')
  }
}

const args = process.argv.slice(2)
const dryRun = !(args.includes('--apply'))

run(dryRun).catch((e)=>{ console.error(e); process.exit(1) }).finally(async ()=>{ await prisma.$disconnect() })
