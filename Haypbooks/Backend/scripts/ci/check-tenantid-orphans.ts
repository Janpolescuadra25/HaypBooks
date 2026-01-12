import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Threshold can be set via ORPHAN_THRESHOLD env var (default: 0)
const threshold = Number(process.env.ORPHAN_THRESHOLD || '0')

async function run() {
  console.info('[CI-ORPHAN-CHECK] Scanning tenant-like columns for NULL tenant values')
  const cols: any = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND (column_name ILIKE 'tenant%')
    GROUP BY table_name, column_name
  `)

  let total = 0
  for (const r of cols) {
    try {
      const cntRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."${r.table_name}" WHERE "${r.column_name}" IS NULL`)
      const cnt = cntRes && cntRes[0] ? cntRes[0].cnt : 0
      if (cnt > 0) {
        console.info(`[CI-ORPHAN-CHECK] ${r.table_name}.${r.column_name} -> ${cnt} nulls`)
        total += cnt
      }
    } catch (err) {
      console.warn('[CI-ORPHAN-CHECK] Error scanning', r.table_name, r.column_name, err.message || err)
    }
  }

  console.info('[CI-ORPHAN-CHECK] total orphan tenant rows:', total)
  await prisma.$disconnect()

  if (total > threshold) {
    console.error(`[CI-ORPHAN-CHECK] Total ${total} exceeds threshold ${threshold}. Failing.`)
    process.exit(1)
  }
  process.exit(0)
}

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(2) })