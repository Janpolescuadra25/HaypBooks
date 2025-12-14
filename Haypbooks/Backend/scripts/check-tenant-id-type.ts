import { PrismaClient } from '@prisma/client'
;(async () => {
  const prisma = new PrismaClient()
  try {
    const res = await prisma.$queryRawUnsafe("select column_name, data_type, udt_name from information_schema.columns where table_name='Tenant' and column_name='id';")
    console.log(res)
  } finally {
    await prisma.$disconnect()
  }
})()
