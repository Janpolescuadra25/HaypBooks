const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const c = await prisma.workspace.count();
    console.log('Workspace count:', c);
  }catch(e){
    console.error('Error running workspace count:', e.message);
  }finally{ await prisma.$disconnect(); }
})();