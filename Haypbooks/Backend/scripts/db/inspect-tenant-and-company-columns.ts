import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function isTenantCol(col: string) {
  const c = col.toLowerCase()
  return c.includes('tenant') || c === 'tenantid' || c === 'tenant_id' || c === 'tenantuuid' || c === 'tenant_uuid'
}
function isCompanyCol(col: string) {
  const c = col.toLowerCase()
  return c.includes('company') || c === 'companyid' || c === 'company_id'
}

async function run() {
  console.info('[INSPECT] discovering tenant/company-like columns')
  const cols: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND (column_name ILIKE '%tenant%' OR column_name ILIKE '%company%')
    ORDER BY table_name, column_name
  `)
  if (!cols || cols.length === 0) {
    console.info('[INSPECT] no tenant/company-like columns found')
    return
  }

  const tables = new Map<string, {tenantCols: string[], companyCols: string[]}>()
  for (const r of cols) {
    const t = r.table_name
    const c = r.column_name
    const entry = tables.get(t) || { tenantCols: [], companyCols: [] }
    if (isTenantCol(c)) entry.tenantCols.push(c)
    if (isCompanyCol(c)) entry.companyCols.push(c)
    tables.set(t, entry)
  }

  for (const [table, {tenantCols, companyCols}] of tables.entries()) {
    console.info('[INSPECT] Table:', table, 'tenantCols=', tenantCols, 'companyCols=', companyCols)

    // If both tenant and company cols exist, report rows where tenant is NULL but company not NULL
    if (tenantCols.length > 0 && companyCols.length > 0) {
      for (const tcol of tenantCols) {
        for (const ccol of companyCols) {
          try {
            const cntRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${table}" WHERE "${tcol}" IS NULL AND "${ccol}" IS NOT NULL`)
            const cnt = cntRes && cntRes[0] ? cntRes[0].cnt : 0
            console.info(`[INSPECT] ${table}: rows with ${tcol} IS NULL and ${ccol} IS NOT NULL =`, cnt)
            if (cnt > 0) {
              const sample: any = await prisma.$queryRawUnsafe(`SELECT id, * FROM public."${table}" WHERE "${tcol}" IS NULL AND "${ccol}" IS NOT NULL LIMIT 10`)
              console.info(`[INSPECT] Sample rows for ${table} where tenant is null but company exists:`, sample)
            }
          } catch (err) {
            console.warn(`[INSPECT] Error querying ${table} (${tcol}, ${ccol}):`, err.message || err)
          }
        }
      }
    } else if (companyCols.length > 0 && tenantCols.length === 0) {
      // table references company but has no tenant column
      for (const ccol of companyCols) {
        try {
          const cntRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${table}" WHERE "${ccol}" IS NOT NULL`)
          const cnt = cntRes && cntRes[0] ? cntRes[0].cnt : 0
          console.info(`[INSPECT] ${table}: has ${cnt} rows with ${ccol} NOT NULL (company present) but no tenant column)`)
          if (cnt > 0) {
            const sample: any = await prisma.$queryRawUnsafe(`SELECT id, * FROM public."${table}" WHERE "${ccol}" IS NOT NULL LIMIT 10`)
            console.info(`[INSPECT] Sample rows for ${table} with company but no tenant column:`, sample)
          }
        } catch (err) {
          console.warn(`[INSPECT] Error querying ${table} (${ccol}):`, err.message || err)
        }
      }
    } else if (tenantCols.length > 0 && companyCols.length === 0) {
      // Table has tenant column but no company column — report rows where tenant is null
      for (const tcol of tenantCols) {
        try {
          const cntRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${table}" WHERE "${tcol}" IS NULL`)
          const cnt = cntRes && cntRes[0] ? cntRes[0].cnt : 0
          console.info(`[INSPECT] ${table}: rows with ${tcol} IS NULL =`, cnt)
          if (cnt > 0) {
            const sample: any = await prisma.$queryRawUnsafe(`SELECT id, * FROM public."${table}" WHERE "${tcol}" IS NULL LIMIT 10`)
            console.info(`[INSPECT] Sample rows for ${table} where tenant column is null:`, sample)
          }
        } catch (err) {
          console.warn(`[INSPECT] Error querying ${table} (${tcol}):`, err.message || err)
        }
      }
    }
  }

  console.info('[INSPECT] complete')
}

run().catch((e)=> console.error(e)).finally(async ()=> await prisma.$disconnect())