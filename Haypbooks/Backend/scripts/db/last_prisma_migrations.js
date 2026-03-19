const { PrismaClient } = require('@prisma/client');
(async function(){
  const p=new PrismaClient();
  try{
    const rows=await p.$queryRawUnsafe('SELECT id, migration_name, started_at, finished_at, logs FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 10');
    console.log(rows);
  }catch(e){ console.error('Error', e.message) }
  finally{ await p.$disconnect(); }
})();
