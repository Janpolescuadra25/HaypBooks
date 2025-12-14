require('dotenv').config({ path: process.cwd() + '/.env' });
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const r = await prisma.$queryRawUnsafe("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Contact' AND column_name='id'");
    console.log(JSON.stringify(r, null, 2));
  } catch (e) { console.error(e); process.exit(1) } finally { await prisma.$disconnect(); }
})();
