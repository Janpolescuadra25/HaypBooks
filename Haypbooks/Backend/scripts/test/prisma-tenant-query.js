const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  await p.$connect()
  try {
    const r = await p.$queryRawUnsafe('SELECT active_project_count FROM "Tenant" LIMIT 1')
    console.log('OK', r)
  } catch (e) {
    console.error('PRISMA RAW ERROR', e.message)
  } finally {
    await p.$disconnect()
  }
})()
