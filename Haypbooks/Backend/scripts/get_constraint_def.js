const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const rows = await p.$queryRaw`SELECT conname, conrelid::regclass::text as table_from, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname='Task_tenantId_assigneeId_fkey'`
    console.table(rows)
  }catch(e){
    console.error(e.message)
  }finally{await p.$disconnect()}
}
run()
