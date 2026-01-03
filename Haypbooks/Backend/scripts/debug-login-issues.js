const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const since = new Date(Date.now() - 60 * 60 * 1000); // last 60 minutes
  console.log('\n🔍 Recent LOGIN_* security events (last 60 minutes):\n');
  const events = await prisma.userSecurityEvent.findMany({
    where: { createdAt: { gte: since }, type: { startsWith: 'LOGIN' } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  if (!events.length) {
    console.log('No recent LOGIN_* events found in the last 60 minutes.');
  } else {
    for (const ev of events) {
      console.log(`- ${ev.createdAt.toISOString()}  ${ev.type}  email=${ev.email || '-'} userId=${ev.userId || '-'} ip=${ev.ipAddress || '-'} ua=${ev.userAgent || '-'} id=${ev.id}`)
    }
  }

  // Gather unique emails/userIds from recent events
  const emails = [...new Set(events.map(e => e.email).filter(Boolean))].slice(0, 20)
  const userIds = [...new Set(events.map(e => e.userId).filter(Boolean))].slice(0, 20)

  // For each email, show counts in last 15 minutes
  if (emails.length) {
    console.log('\nℹ️  Login failure counts (last 15 minutes) by email:');
    for (const email of emails) {
      const since15 = new Date(Date.now() - 15 * 60 * 1000)
      const count = await prisma.userSecurityEvent.count({ where: { email, createdAt: { gte: since15 }, type: { startsWith: 'LOGIN_FAILED' } } })
      console.log(`- ${email}: ${count} failed attempts (last 15m)`) 
    }
  }

  // For each userId, show sessions
  if (userIds.length) {
    console.log('\n🔐 Session rows for affected users:');
    for (const uid of userIds) {
      const sess = await prisma.session.findMany({ where: { userId: uid } })
      console.log(`\nUser ${uid}: ${sess.length} session(s)`)
      for (const s of sess) {
        console.log(`  - id=${s.id} refreshToken=${s.refreshToken.substring(0,8)}... expiresAt=${s.expiresAt.toISOString()} revoked=${s.revoked}`)
      }
      const user = await prisma.user.findUnique({ where: { id: uid } })
      if (user) {
        console.log(`  -> user.email=${user.email} isEmailVerified=${user.isEmailVerified} passwordHashPresent=${!!user.password}`)
      }
    }
  }

  // If there were events but no emails, list recent sessions overall
  if (!userIds.length && events.length) {
    console.log('\nNo userIds present on recent events; listing recent sessions (last 100) for inspection:');
    const sessions = await prisma.session.findMany({ orderBy: { lastUsedAt: 'desc' }, take: 100 })
    for (const s of sessions) {
      console.log(`- session.id=${s.id} userId=${s.userId} refreshToken=${s.refreshToken.substring(0,8)}... expiresAt=${s.expiresAt.toISOString()} revoked=${s.revoked}`)
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Script error:', e);
  try { await prisma.$disconnect(); } catch(e){}
  process.exit(1);
});
