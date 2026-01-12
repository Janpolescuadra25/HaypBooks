import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const argv = process.argv.slice(2)
const apply = argv.includes('--apply')

async function run() {
  console.info('[BACKFILL-SUB] Inspecting Subscription tenantId column (apply=%s)', apply)
  // Check if tenantId column exists
  const colCheck: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM information_schema.columns WHERE table_schema='public' AND table_name='subscription' AND column_name='tenantid'`)
  const exists = colCheck && colCheck[0] ? colCheck[0].cnt > 0 : false

  if (!exists) {
    console.info('[BACKFILL-SUB] subscription.tenantId column DOES NOT exist')
    console.info('[BACKFILL-SUB] Recommended SQL to add column (nullable):')
    console.info("ALTER TABLE public.\"Subscription\" ADD COLUMN \"tenantId\" uuid;")
    console.info('[BACKFILL-SUB] Optionally add index:')
    console.info('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_tenantid ON public."Subscription"("tenantId");')
    if (!apply) {
      console.info('[BACKFILL-SUB] To apply the change run with --apply')
      await prisma.$disconnect()
      return
    }

    console.info('[BACKFILL-SUB] Applying ALTER TABLE to add tenantId (nullable)')
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE public."Subscription" ADD COLUMN IF NOT EXISTS "tenantId" uuid;`)
      console.info('[BACKFILL-SUB] Column added')
    } catch (err) {
      console.error('[BACKFILL-SUB] Failed to add column:', err.message || err)
      await prisma.$disconnect()
      process.exit(1)
    }
  } else {
    console.info('[BACKFILL-SUB] subscription.tenantId column exists')
  }

  // Detect company column variant in Subscription (companyId, company_id, companyid)
  try {
    const colCandidates = ['companyId', 'company_id', 'companyid']
    let foundCol: string | null = null
    for (const c of colCandidates) {
      const colCheck: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM information_schema.columns WHERE table_schema='public' AND table_name ILIKE 'subscription' AND column_name IN ('${c}', '${c.toLowerCase()}')`)
      const exists = colCheck && colCheck[0] ? colCheck[0].cnt > 0 : false
      if (exists) {
        foundCol = c
        break
      }
    }

    if (!foundCol) {
      console.warn('[BACKFILL-SUB] Could not find a company column on Subscription (checked companyId/company_id/companyid). Aborting backfill.')
      await prisma.$disconnect()
      return
    }

    const cntRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."Subscription" s WHERE s."tenantId" IS NULL AND s."${foundCol}" IS NOT NULL`)
    const cnt = cntRes && cntRes[0] ? cntRes[0].cnt : 0
    console.info('[BACKFILL-SUB] subscriptions missing tenantId but have', foundCol + ':', cnt)
    if (cnt > 0) {
      const sample: any = await prisma.$queryRawUnsafe(`SELECT * FROM public."Subscription" s WHERE s."tenantId" IS NULL AND s."${foundCol}" IS NOT NULL LIMIT 10`)
      console.info('[BACKFILL-SUB] Sample rows:', sample)

      if (!apply) {
        console.info('[BACKFILL-SUB] To fill tenantId from company tenant: run with --apply')
        await prisma.$disconnect()
        return
      }

      console.info('[BACKFILL-SUB] Applying backfill: setting subscription.tenantId from company.tenantId using', foundCol)
      // Only update when company.tenantId looks like a UUID to avoid casting errors
      const validUuidRegex = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      const cntValidRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM public."Subscription" s JOIN public."Company" c ON s."${foundCol}" = c.id WHERE s."tenantId" IS NULL AND c."tenantId" ~* '${validUuidRegex}'`)
      const cntValid = cntValidRes && cntValidRes[0] ? cntValidRes[0].cnt : 0
      console.info('[BACKFILL-SUB] subscriptions to update (company.tenantId valid uuid):', cntValid)
      if (cntValid > 0) {
        const upd: any = await prisma.$queryRawUnsafe(`UPDATE public."Subscription" s SET "tenantId" = (c."tenantId")::uuid FROM public."Company" c WHERE s."${foundCol}" = c.id AND s."tenantId" IS NULL AND c."tenantId" ~* '${validUuidRegex}' RETURNING s.id`)
        console.info('[BACKFILL-SUB] Updated subscriptions:', (upd && upd.length) ? upd.length : 0)
      } else {
        console.info('[BACKFILL-SUB] No subscriptions updated because company.tenantId values are not valid UUIDs')
      }
    }
  } catch (err) {
    console.error('[BACKFILL-SUB] Failed to count/update subscriptions:', err.message || err)
  }

  await prisma.$disconnect()
}

run().catch((e)=>{
  console.error(e)
  prisma.$disconnect()
})