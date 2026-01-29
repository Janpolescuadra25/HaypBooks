const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run(){
  try{
    const rows = await p.$queryRaw`SELECT conname, conrelid::regclass::text AS table_from, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE contype='f' AND (pg_get_constraintdef(oid) ILIKE '%tenantId%' OR pg_get_constraintdef(oid) ILIKE '%workspaceId%')`;
    console.table(rows)
  }catch(e){
    console.error(e.message)
  }finally{await p.$disconnect()}
}
run()