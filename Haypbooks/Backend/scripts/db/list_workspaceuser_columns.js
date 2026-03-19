const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const rows = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='WorkspaceUser' ORDER BY ordinal_position");
    console.log('WorkspaceUser columns:');
    rows.forEach(r => console.log('  -', r.column_name));
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
