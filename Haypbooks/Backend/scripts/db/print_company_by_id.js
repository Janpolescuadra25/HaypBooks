const { PrismaClient } = require('@prisma/client');
const id = process.argv[2];
if(!id){ console.error('Usage: node print_company_by_id.js <id>'); process.exit(2); }
(async function(){
  const prisma = new PrismaClient();
  try{
    const c = await prisma.company.findUnique({ where: { id } });
    if(!c) console.log('No company found with id', id);
    else console.log('Company:', c);
  }catch(e){ console.error('Error:', e.message); }
  finally{ await prisma.$disconnect(); }
})();