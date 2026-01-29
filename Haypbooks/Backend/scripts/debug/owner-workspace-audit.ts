import { PrismaClient } from '@prisma/client'

async function run() {
  const prisma = new PrismaClient()
  try {
    console.log('Starting Owner Workspace audit across users...')

    // Find users who have any tenant associations
    const users = await prisma.user.findMany({ select: { id: true, email: true }, take: 2000 })
    let scanned = 0
    let discrepancies = 0
    for (const u of users) {
      scanned++
      // Find tenantIds where user is owner (active)
      const tus = await prisma.workspaceUser.findMany({ where: { userId: u.id, status: 'ACTIVE' }, select: { workspaceId: true, isOwner: true } })
      const ownerTenantIds = tus.filter(t => t.isOwner).map(t => t.tenantId)
      const memberTenantIds = tus.map(t => t.tenantId)

      // Gather companies by tenant membership
      const companiesByMembership: any[] = ownerTenantIds.length > 0 ? await prisma.$queryRawUnsafe('SELECT c.id, c."tenantId", COALESCE(c.name,\'\') as name FROM public."Company" c WHERE c."tenantId" = ANY($1::text[]) AND c."isActive" = true', ownerTenantIds) : []

      // Gather companies returned by "owned" filter (try Prisma, fallback to raw)
      let companiesOwned: any[] = []
      try {
        companiesOwned = await prisma.company.findMany({ where: { isActive: true, tenant: { users: { some: { userId: u.id, isOwner: true, status: 'ACTIVE' } } } }, select: { id: true, workspaceId: true, name: true } })
      } catch (e) {
        // fallback
        const tusForOwned = await prisma.workspaceUser.findMany({ where: { userId: u.id, isOwner: true, status: 'ACTIVE' }, select: { workspaceId: true } })
        const tenantIds = tusForOwned.map(t => t.tenantId)
        if (tenantIds.length > 0) {
          companiesOwned = await prisma.$queryRawUnsafe('SELECT c.id, c."tenantId", COALESCE(c.name,\'\') as name FROM public."Company" c WHERE c."tenantId" = ANY($1::text[]) AND c."isActive" = true', tenantIds)
        }
      }

      // Compare sets by id
      const membershipIds = new Set(companiesByMembership.map((c: any) => c.id))
      const ownedIds = new Set(companiesOwned.map((c: any) => c.id))

      // If there are companies by membership but none returned by owned query => discrepancy
      const missing = Array.from(membershipIds).filter(id => !ownedIds.has(id))
      if (missing.length > 0) {
        discrepancies++
        console.log('\n[DISCREPANCY] user:', u.email, 'userId:', u.id)
        console.log(' ownerTenantIds:', ownerTenantIds)
        console.log(' companiesByMembership:', companiesByMembership)
        console.log(' companiesOwned:', companiesOwned)
        console.log(' missing company ids (present by membership but not in owned):', missing)
      }
    }

    console.log(`\nAudit complete. Scanned users: ${scanned}. Discrepancies found: ${discrepancies}.`)
    // Exit non-zero when discrepancies found so CI can fail fast and alert
    if (discrepancies > 0) {
      console.error(`Audit found ${discrepancies} discrepancies. Exiting with code 2.`)
      await prisma.$disconnect()
      process.exit(2)
    }
  } catch (e) {
    console.error('Audit failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) run().catch((e) => { console.error(e); process.exit(1) })
