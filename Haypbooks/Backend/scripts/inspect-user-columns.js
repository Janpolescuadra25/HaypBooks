const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  try {
    const rows = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='\"User\"' ORDER BY ordinal_position")
    console.log(rows)
  } catch (e) {
    console.error(e)
  } finally {
    await p.$disconnect()
  }
})()