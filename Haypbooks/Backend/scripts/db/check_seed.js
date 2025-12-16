const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const tenants = await prisma.tenant.count();
    const users = await prisma.user.count();
    console.log('Tenant count:', tenants);
    console.log('User count:', users);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();