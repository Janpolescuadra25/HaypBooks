const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const rows = await p.$queryRaw`
      SELECT conname, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
      WHERE contype = 'f' AND confrelid = 'public."Tenant"'::regclass
    `
    console.table(rows)
  }catch(e){
    console.error(e.message)
  }finally{
    await p.$disconnect()
  }
}
run()
