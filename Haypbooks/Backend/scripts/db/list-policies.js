require('dotenv').config({ path: process.cwd() + '/.env' });
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const tables = ['ContactEmail', 'ContactPhone', 'CustomerCredit', 'CustomerCreditLine', 'CustomerCreditApplication'];
    for (const t of tables) {
      const q = `SELECT policyname, permissive, qual, WITH_CHECK FROM pg_policies WHERE schemaname = 'public' AND tablename = '${t}'`;
      const r = await prisma.$queryRawUnsafe(q);
      console.log(t + ':', JSON.stringify(r, null, 2));
    }
  } catch (e) { console.error(e); process.exit(1) } finally { await prisma.$disconnect(); }
})();
