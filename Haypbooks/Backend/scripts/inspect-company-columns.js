const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  try {
    const rows = await p.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Company' ORDER BY ordinal_position")
    console.log(rows)
  } catch (e) {
    console.error(e)
  } finally {
    await p.$disconnect()
  }
})()