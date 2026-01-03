const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const ev = await prisma.userSecurityEvent.findMany({ where: { type: { startsWith: 'REFRESH_USED_IN_BODY' } }, orderBy: { createdAt: 'desc' } });
  console.log('FOUND', ev.length);
  ev.forEach(e => console.log(e.createdAt.toISOString(), e.type, e.email));
  await prisma.$disconnect();
})().catch(async e => { console.error(e); try { await prisma.$disconnect() } catch {} });