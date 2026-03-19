const { PrismaClient } = require('@prisma/client');
const id = process.argv[2];
if(!id){ console.error('Usage: node find_workspace_by_id.js <id>'); process.exit(2); }
(async function(){
  const prisma = new PrismaClient();
  try{
    const w = await prisma.workspace.findUnique({ where: { id } });
    if(!w) console.log('No workspace found with id', id);
    else console.log('Workspace found:', w);
  }catch(e){ console.error('Error:', e.message); }
  finally{ await prisma.$disconnect(); }
})();