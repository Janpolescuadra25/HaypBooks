const { PrismaClient } = require('@prisma/client');

(async function(){
  const prisma = new PrismaClient();
  try {
    const perms = await prisma.permission.findMany({ select: { key: true } });
    console.log(perms.map(p => p.key));
  } catch (e) {
    console.error('Error listing permissions', e);
  } finally {
    await prisma.$disconnect();
  }
})();