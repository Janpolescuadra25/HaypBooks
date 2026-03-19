const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const rows = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name");
    console.log('Tables with tenantId column:');
    if (!rows || rows.length === 0) return console.log('  <none>');
    rows.forEach(r => console.log('  -', r.table_name));
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
