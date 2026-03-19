const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const rows = await prisma.$queryRawUnsafe("SELECT id, migration_name, started_at, finished_at, logs FROM \"_prisma_migrations\" WHERE migration_name LIKE '20260126%' ORDER BY started_at DESC");
    console.log('Recent tenant-related migrations:');
    rows.forEach(r => console.log(r));
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
