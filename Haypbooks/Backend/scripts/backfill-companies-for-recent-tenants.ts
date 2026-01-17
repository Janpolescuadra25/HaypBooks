import { PrismaClient } from '@prisma/client'

;(async () => {
  const prisma = new PrismaClient()
  try {
    const since = new Date(Date.now() - 1000 * 60 * 60) // last 60 minutes
    const tenants = await prisma.tenant.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'asc' } })
    if (!tenants || tenants.length === 0) {
      console.log('No recent tenants found')
      return
    }

    for (const t of tenants) {
      const existing = await prisma.company.findFirst({ where: { tenantId: t.id } })
      if (existing) {
        console.log('Tenant already has company:', { tenantId: t.id, companyId: existing.id, name: existing.name })
        continue
      }
      const name = t.name || `Company ${t.id.slice(0, 8)}`
      const created = await prisma.company.create({ data: { tenantId: t.id, name, isActive: true } })
      console.log('Created Company for tenant:', { tenantId: t.id, companyId: created.id, name: created.name })
      try {
        await prisma.tenant.update({ where: { id: t.id }, data: { companiesCreated: { increment: 1 } } })
      } catch (e) {
        console.warn('Failed to increment companiesCreated for tenant', t.id)
      }
    }
  } catch (e) {
    console.error('Error in backfill script', e)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
})()
