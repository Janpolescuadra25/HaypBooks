const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const rows = await p.$queryRaw`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='id'`;
    console.table(rows)
  }catch(e){
    console.error(e.message)
  }finally{
    await p.$disconnect()
  }
}
run()
