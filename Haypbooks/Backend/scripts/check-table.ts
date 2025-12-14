import { PrismaClient } from '@prisma/client'
;(async () => {
  const prisma = new PrismaClient()
  try {
     const res = await prisma.$queryRawUnsafe("select to_regclass('public.Timesheet') as tbl;")
    console.log(res)
  } finally {
    await prisma.$disconnect()
  }
})()
