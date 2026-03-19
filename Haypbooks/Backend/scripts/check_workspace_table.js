const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const res = await prisma.$queryRawUnsafe("SELECT to_regclass('public.\"Workspace\"')::text as r");
    console.log(res);
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
