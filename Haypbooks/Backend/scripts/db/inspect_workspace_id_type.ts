import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const res = await prisma.$queryRawUnsafe("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='Workspace' AND column_name='id'")
  console.log(res)
  await prisma.$disconnect()
}

main().catch(e=>{console.error(e);process.exit(1)})
