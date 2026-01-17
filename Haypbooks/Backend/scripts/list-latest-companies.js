const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const cs = await p.company.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    console.log(cs.map(c => ({ id: c.id, name: c.name, tenantId: c.tenantId, createdAt: c.createdAt })));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();