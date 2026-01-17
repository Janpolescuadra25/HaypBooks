const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    console.log('Creating unique index tenantuser_tenantid_userid_uq (if missing)')
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS tenantuser_tenantid_userid_uq ON public."TenantUser" ("tenantId","userId")')
    console.log('Index created (or already existed)')
  } catch (e) {
    console.error('Failed to create index:', e)
  } finally {
    await prisma.$disconnect()
  }
})()