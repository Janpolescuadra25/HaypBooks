import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main(){
  const rows:any = await p.$queryRaw`SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Task'`
  console.log(rows)
  await p.$disconnect()
}
main().catch(e=>{console.error(e); process.exit(1)})