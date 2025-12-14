import { PrismaClient } from '@prisma/client'
;(async () => {
  const prisma = new PrismaClient()
  try {
    const tables = ['Tenant','Employee','Project','User']
    for (const t of tables) {
      const res = await prisma.$queryRawUnsafe(`select table_name, column_name, data_type, udt_name from information_schema.columns where table_name='${t}' and column_name='id';`)
      console.log(t, res)
    }
  } finally {
    await prisma.$disconnect()
  }
})()
