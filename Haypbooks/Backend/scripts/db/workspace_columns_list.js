const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try{
    const cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='Workspace' AND table_schema='public'`;
    const names = cols.map(r => r.column_name);
    console.log('Workspace columns (raw):', names);
    console.log('Lowercased:', names.map(n=>n.toLowerCase()));
  }catch(e){ console.error('Error:', e.message); } finally { await prisma.$disconnect(); }
})();