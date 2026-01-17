const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const id = require('crypto').randomUUID();
    const res = await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES ($1,$2,$3,now(),now())', id, 'Raw Insert Tenant', 'USD');
    console.log('raw insert res', res);
  } catch (e) {
    console.error('Prisma raw Error:', e.message, e.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();