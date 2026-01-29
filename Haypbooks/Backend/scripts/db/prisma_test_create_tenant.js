const prisma = require('./prisma-client-compat');
(async () => {
  try {
    const t = await prisma.tenant.create({ data: { name: 'Prisma Test Tenant', baseCurrency: 'USD' } });
    console.log('created via prisma', t);
  } catch (e) {
    console.error('Prisma Error:', e.message, e.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();