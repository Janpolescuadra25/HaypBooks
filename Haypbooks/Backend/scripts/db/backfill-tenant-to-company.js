const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function columnExists(table, column) {
  const res = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
    table,
    column,
  )
  return res && res.length > 0
}

async function run() {
  try {
    console.log('Backfilling Tenant onboarding/business fields into Company records')

    const tenants = await prisma.tenant.findMany({})
    console.log(`Found ${tenants.length} tenant(s) to inspect`)

    for (const t of tenants) {
      // Ensure a Company exists for this tenant. Prefer creating a Company with id == tenant.id
      let company = await prisma.company.findFirst({ where: { tenantId: t.id } })
      if (!company) {
        // Try to create company with same id as tenant if the id is unused
        try {
          console.log(`Creating company for tenant ${t.id} (trying id=${t.id})`)
          company = await prisma.company.create({ data: { id: t.id, tenantId: t.id, name: t.name || `Default Company ${t.id}`, currency: t.baseCurrency || 'USD' } })
          console.log(`  Created company ${company.id} for tenant ${t.id}`)
        } catch (e) {
          // If creation failed (id conflict), create a new company id and attempt to migrate any subscriptions
          console.warn(`  Could not create company with id=${t.id} (may already exist), creating a new company and remapping subscriptions`) 
          company = await prisma.company.create({ data: { tenantId: t.id, name: t.name || `Default Company ${t.id}`, currency: t.baseCurrency || 'USD' } })
          // Move any subscriptions that pointed to tenant.id as companyId to the newly created company
          try {
            const moved = await prisma.$executeRawUnsafe(`UPDATE public."Subscription" SET "companyId" = $1 WHERE "companyId" = $2 AND "tenantId" = $3`, company.id, t.id, t.id)
            console.log(`  Remapped subscriptions referencing tenant->company (${t.id}) to new company ${company.id}`)
          } catch (e2) {
            console.warn('  Failed to remap subscriptions (non-fatal):', e2?.message || e2)
          }
        }
      } else {
        console.log(`Tenant ${t.id} already has a Company (${company.id})`) 
      }

      // Copy over onboarding/business fields from Tenant to Company where Company fields are null
      const fields = [
        { name: 'businessType', type: 'text' },
        { name: 'industry', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'taxId', type: 'text' },
        { name: 'logoUrl', type: 'text' },
        { name: 'invoicePrefix', type: 'text' },
        { name: 'vatRegistered', type: 'boolean' },
        { name: 'vatRate', type: 'numeric' },
        { name: 'pricesInclusive', type: 'boolean' },
        { name: 'defaultPaymentTerms', type: 'text' },
        { name: 'accountingMethod', type: 'text' }
      ]

      for (const f of fields) {
        const col = f.name
        const tenantHas = await columnExists('Tenant', col)
        const companyHas = await columnExists('Company', col)
        if (!companyHas) continue // nothing to do if company doesn't have the column
        if (!tenantHas) continue

        try {
          // Update only where company field is null
          const res = await prisma.$executeRawUnsafe(
            `UPDATE public."Company" c SET "${col}" = t."${col}" FROM public."Tenant" t WHERE c."tenantId" = t.id AND (c."${col}" IS NULL) AND (t."${col}" IS NOT NULL)`
          )
          // Log is noisy; we skip per-field counts for brevity
        } catch (e) {
          console.warn(`  Failed to copy field ${col} for tenant ${t.id} -> company ${company.id}:`, e?.message || e)
        }
      }
    }

    console.log('Backfill completed')
  } catch (e) {
    console.error('Backfill failed:', e && e.message ? e.message : e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
