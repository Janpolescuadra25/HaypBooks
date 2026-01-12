import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run(){
  const r:any = await prisma.$queryRawUnsafe("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name ILIKE 'company' AND column_name ILIKE 'tenant%'")
  console.info('Company tenant columns:', r)
  await prisma.$disconnect()
}

run().catch(e=>{console.error(e); prisma.$disconnect()})