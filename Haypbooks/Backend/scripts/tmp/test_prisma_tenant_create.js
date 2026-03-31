const { PrismaClient } = require('@prisma/client')
;(async ()=>{
  const prisma = new PrismaClient()
  try {
    const tenantId = require('crypto').randomUUID()
    const payload = { id: tenantId, name: 'Prisma Created Tenant', workspaceName: 'PrismaTest', users: { create: [{ userId: 'cmkjz9nmc0034555gq22xjjo2', role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' }] } }
    console.log('attempting prisma.tenant.create with payload:', payload)
    const t = await prisma.tenant.create({ data: payload })
    console.log('created tenant', t)
  } catch (e) {
    console.error('error creating tenant via prisma:', e && e.message ? e.message : e)
    console.error('full err', e)
  } finally {
    await prisma.$disconnect()
  }
})()