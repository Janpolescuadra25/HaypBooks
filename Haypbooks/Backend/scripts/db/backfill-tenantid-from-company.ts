import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const argv = process.argv.slice(2)
const apply = argv.includes('--apply')

// Mappings describing how to get companyId for a given table
const mappings: Array<{
  table: string
  // Either a column directly on the table containing companyId
  companyColumn?: string
  // Or a join to another table (joinTable) using joinColumn which contains companyId
  joinTable?: string
  joinColumn?: string
}> = [
  { table: 'Invoice', companyColumn: 'companyId' },
  { table: 'InvoiceLine', joinTable: 'Invoice', joinColumn: 'invoiceId' },
  { table: 'PaymentReceived', companyColumn: 'companyId' },
  { table: 'Bill', companyColumn: 'companyId' },
  { table: 'BankAccount', companyColumn: 'companyId' },
  { table: 'BankTransaction', companyColumn: 'companyId' },
  { table: 'RecurringInvoice', companyColumn: 'companyId' },
  { table: 'CustomerCredit', companyColumn: 'companyId' },
  { table: 'CustomerCreditLine', joinTable: 'CustomerCredit', joinColumn: 'customerCreditId' },
  // add more mappings as needed
]

async function run() {
  console.info('[BACKFILL-TID] Starting backfill tenantId from company (apply=%s)', apply)

  for (const m of mappings) {
    if (m.companyColumn) {
      try {
        // Try multiple table/column naming variants until one works
        const tableCandidates = [m.table, m.table.toLowerCase(), m.table.toLowerCase() + 's', m.table.replace(/([A-Z])/g, '_$1').toLowerCase(), m.table.replace(/([A-Z])/g, '_$1').toLowerCase() + 's']
        const colCandidates = [m.companyColumn, m.companyColumn.toLowerCase(), m.companyColumn.replace(/([A-Z])/g, '_$1').toLowerCase(), m.companyColumn.replace(/([A-Z])/g, '_$1').toLowerCase()]

        let found = false
        let cnt = 0
        let usedTable = ''
        let usedCol = ''

        for (const t of tableCandidates) {
          for (const c of colCandidates) {
            try {
              const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${t}" WHERE "tenantId" IS NULL AND "${c}" IS NOT NULL`)
              if (res && res[0]) {
                cnt = res[0].cnt
                found = true
                usedTable = t
                usedCol = c
                break
              }
            } catch (_e) {
              // ignore and try next candidate
            }
          }
          if (found) break
        }

        if (!found) {
          console.warn(`[BACKFILL-TID] Skipping ${m.table}: could not find table/column variant for companyId`)
          continue
        }

        console.info(`[BACKFILL-TID] Table=${m.table} (resolved ${usedTable}.${usedCol}) missing tenantId (direct company):`, cnt)
        if (apply && cnt > 0) {
          // Update by joining to Company using resolved names
          const sql = `UPDATE public."${usedTable}" t SET "tenantId" = c."tenantId" FROM public."Company" c WHERE t."${usedCol}" = c.id AND t."tenantId" IS NULL RETURNING t.id;`
          const updated: any[] = await prisma.$queryRawUnsafe(sql)
          console.info(`[BACKFILL-TID] Updated ${m.table} (resolved ${usedTable}.${usedCol}): `, (updated && updated.length) ? updated.length : 0)
        }
      } catch (err) {
        console.warn(`[BACKFILL-TID] Skipping ${m.table} due to error:`, err.message || err)
        continue
      }
    } else if (m.joinTable && m.joinColumn) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${m.table}" t JOIN public."${m.joinTable}" j ON t."${m.joinColumn}" = j.id WHERE t."tenantId" IS NULL AND j."companyId" IS NOT NULL`)
      const cnt = res && res[0] ? res[0].cnt : 0
      console.info(`[BACKFILL-TID] Table=${m.table} missing tenantId (via ${m.joinTable}):`, cnt)
      if (apply && cnt > 0) {
        const sql = `UPDATE public."${m.table}" t SET "tenantId" = j."tenantId" FROM public."${m.joinTable}" j WHERE t."${m.joinColumn}" = j.id AND t."tenantId" IS NULL RETURNING t.id;`
        const updated: any[] = await prisma.$queryRawUnsafe(sql)
        console.info(`[BACKFILL-TID] Updated ${m.table}: `, (updated && updated.length) ? updated.length : 0)
      }
    }
  }

  console.info('[BACKFILL-TID] Complete')
}

run().catch((e) => {
  console.error('[BACKFILL-TID] Fatal', e)
}).finally(async () => {
  await prisma.$disconnect()
})