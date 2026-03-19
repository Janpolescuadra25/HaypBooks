const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const ws = await prisma.workspace.findMany({ select: { id: true, ownerUserId: true, status: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
    console.log('Workspaces:', ws);
  }catch(e){ console.error('Error listing workspaces:', e.message); }
  finally{ await prisma.$disconnect(); }
})();