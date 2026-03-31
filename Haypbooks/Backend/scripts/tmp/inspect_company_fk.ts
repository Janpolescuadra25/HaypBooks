import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
;(async()=>{
  try {
    const res: any = await prisma.$queryRawUnsafe("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname = 'Company_tenantId_fkey'")
    console.log(res)
    const cols: any = await prisma.$queryRawUnsafe("SELECT conname, conrelid::regclass AS table, unnest(conkey) as attnum FROM pg_constraint WHERE conname = 'Company_tenantId_fkey'")
    console.log('cols', cols)
    const att: any = await prisma.$queryRawUnsafe("SELECT a.attnum, a.attname, format_type(a.atttypid,a.atttypmod) as typ FROM pg_attribute a WHERE a.attrelid = 'Company'::regclass AND a.attname IN ('tenantId','tenantId_old')")
    console.log('Company attrs:', att)
    const tid: any = await prisma.$queryRawUnsafe("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'Tenant'")
    console.log('Tenant columns:', tid)
  } catch (e: any) {
    console.error('inspect error', e?.message || e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
