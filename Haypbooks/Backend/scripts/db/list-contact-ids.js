require('dotenv').config({ path: process.cwd() + '/.env' });
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const r = await prisma.$queryRawUnsafe("SELECT id FROM \"Contact\" LIMIT 10");
    console.log(JSON.stringify(r, null, 2));
  } catch (e) { console.error(e); process.exit(1) } finally { await prisma.$disconnect(); }
})();
