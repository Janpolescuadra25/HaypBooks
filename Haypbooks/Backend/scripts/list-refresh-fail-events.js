const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const since = new Date(Date.now() - 60*60*1000);
  const events = await prisma.userSecurityEvent.findMany({ where: { createdAt: { gte: since }, type: { startsWith: 'REFRESH_FAILED' } }, orderBy: { createdAt: 'desc' } });
  console.log('Found', events.length, 'REFRESH_FAILED events in last hour');
  for (const e of events) console.log(`${e.createdAt.toISOString()}  type=${e.type} emailOrPrefix=${e.email || '-'} ip=${e.ipAddress || '-'} ua=${e.userAgent || '-'} id=${e.id}`)
  await prisma.$disconnect();
}

main().catch(async (e)=>{ console.error(e); try{ await prisma.$disconnect(); }catch{}; process.exit(1); });