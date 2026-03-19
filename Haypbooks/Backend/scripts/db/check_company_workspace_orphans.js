const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const nullCount = await prisma.$queryRaw`SELECT COUNT(*)::int as cnt FROM "Company" WHERE "workspaceId" IS NULL`;
    const invalidCount = await prisma.$queryRaw`SELECT COUNT(*)::int as cnt FROM "Company" c WHERE c."workspaceId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Workspace" w WHERE w.id = c."workspaceId")`;
    console.log('Companies with workspaceId IS NULL:', nullCount[0].cnt);
    console.log('Companies with workspaceId pointing to missing Workspace:', invalidCount[0].cnt);
    if(nullCount[0].cnt > 0){
      const rows = await prisma.$queryRaw`SELECT id, name, "workspaceId" FROM "Company" WHERE "workspaceId" IS NULL LIMIT 20`;
      console.log('Sample companies with NULL workspaceId:', rows);
    }
    if(invalidCount[0].cnt > 0){
      const rows = await prisma.$queryRaw`SELECT c.id, c.name, c."workspaceId" FROM "Company" c WHERE c."workspaceId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Workspace" w WHERE w.id = c."workspaceId") LIMIT 20`;
      console.log('Sample companies with invalid workspaceId:', rows);
    }
  }catch(e){
    console.error('Error checking companies:', e.message);
  }finally{ await prisma.$disconnect(); }
})();