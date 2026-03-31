const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe('SELECT id, "createdAt" FROM public."Tenant" ORDER BY "createdAt" DESC LIMIT 20');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('query error', e);
  } finally {
    await prisma.$disconnect();
  }
})();