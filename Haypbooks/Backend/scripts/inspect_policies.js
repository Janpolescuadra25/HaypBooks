const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const rows = await p.$queryRaw`SELECT schemaname::text AS schemaname, tablename::text AS tablename, policyname::text AS policyname, permissive::text AS permissive, roles::text AS roles FROM pg_policies LIMIT 5`;
    console.table(rows)
  }catch(e){
    console.error(e.message)
  }finally{await p.$disconnect()}
}
run()
