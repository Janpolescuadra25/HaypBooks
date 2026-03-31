import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
;(async()=>{
  try {
    const rows: any = await prisma.$queryRawUnsafe("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE pg_get_constraintdef(oid) LIKE '%tenantId_old%';")
    console.log('constraints referencing tenantId_old:', rows)
  } catch (e: any) {
    console.error('error', e?.message || e)
    process.exit(1)
  } finally { await prisma.$disconnect() }
})()
