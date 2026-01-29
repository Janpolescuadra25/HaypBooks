const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const r = await p.$queryRaw`SELECT count(*) AS bad FROM public."Tenant" WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'`
    console.log(r)
  }catch(e){
    console.error(e.message)
  }finally{await p.$disconnect()}
}
run()