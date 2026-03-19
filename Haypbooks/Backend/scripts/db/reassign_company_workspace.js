const { PrismaClient } = require('@prisma/client');
const id = process.argv[2];
const to = process.argv[3];
if(!id || !to){ console.error('Usage: node reassign_company_workspace.js <companyId> <targetWorkspaceId>'); process.exit(2); }
(async function(){
  const prisma = new PrismaClient();
  try{
    const c = await prisma.company.findUnique({ where: { id } });
    if(!c) return console.error('Company not found', id);
    console.log('Before:', { id: c.id, name: c.name, workspaceId: c.workspaceId });
    await prisma.company.update({ where: { id }, data: { workspaceId: to, migrationNote: (c.migrationNote || '') + `\nReassigned workspace ${to} on ${new Date().toISOString()}` } });
    const after = await prisma.company.findUnique({ where: { id } });
    console.log('After:', { id: after.id, name: after.name, workspaceId: after.workspaceId, migrationNote: after.migrationNote });
  }catch(e){ console.error('Error:', e.message); } finally { await prisma.$disconnect(); }
})();