import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  console.info('[ORPHANS-ALL] Scanning all tables that have a tenantId column')
  const tablesRaw: any = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name ILIKE 'tenant%'
    GROUP BY table_name
  `)

  const tables = (tablesRaw || []).map((r: any) => r.table_name)
  if (!tables.length) {
    console.info('[ORPHANS-ALL] No tables found with tenantId column')
    return
  }

  for (const t of tables) {
    try {
      const countRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${t}" WHERE "tenantId" IS NULL`)
      const cnt = (countRes && countRes[0]) ? countRes[0].cnt : 0
      if (cnt > 0) {
        console.info(`[ORPHANS-ALL] ${t} has ${cnt} rows with tenantId IS NULL`)
        const sample: any = await prisma.$queryRawUnsafe(`SELECT id, * FROM public."${t}" WHERE "tenantId" IS NULL LIMIT 10`)
        console.info(`[ORPHANS-ALL] Sample rows for ${t}:`, sample)
      } else {
        console.info(`[ORPHANS-ALL] ${t} has no tenantId NULL rows`)        
      }
    } catch (err) {
      console.warn(`[ORPHANS-ALL] Error scanning ${t}:`, err.message || err)
    }
  }

  console.info('[ORPHANS-ALL] Scan complete')
}

run().catch((e)=> console.error(e)).finally(async ()=> await prisma.$disconnect())