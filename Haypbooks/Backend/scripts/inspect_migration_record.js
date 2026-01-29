const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
async function run(){
  try{
    const r = await p.$queryRaw`SELECT id, migration_name, started_at, finished_at, logs FROM _prisma_migrations WHERE migration_name='20260126203000_tenant_id_to_uuid'`;
    console.table(r)
  }catch(e){console.error(e.message)}finally{await p.$disconnect()}
}
run()