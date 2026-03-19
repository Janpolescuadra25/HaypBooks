const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const c = await prisma.workspace.count();
    console.log('Workspace count (OK):', c);
  }catch(e){
    console.error('Error querying Workspace:', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
