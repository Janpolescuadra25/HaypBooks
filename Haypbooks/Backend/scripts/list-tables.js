const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  try {
    const rows = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
    console.log(rows.map(r=>r.table_name))
  } catch (e) {
    console.error(e)
  } finally {
    await p.$disconnect()
  }
})()