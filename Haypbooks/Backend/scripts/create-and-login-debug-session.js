const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const axios = require('axios');

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const email = `ci-debug-login-${ts}@haypbooks.test`;
  const password = 'TestPass123!';
  console.log('\n➡️  Creating test user:', email);

  const hashed = await bcrypt.hash(password, 10);
  try {
    const u = await prisma.user.create({ data: { email, password: hashed, name: 'CI Debug User', isEmailVerified: true, role: 'owner' } });
    // login
    console.log('🔐 Attempting login...');
    const res = await axios.post('http://localhost:4000/api/auth/login', { email, password }, { validateStatus: () => true });
    console.log('-> login status:', res.status);
    const setCookies = res.headers['set-cookie'] || [];
    console.log('-> Set-Cookie count:', setCookies.length);
    const refreshCookie = setCookies.find(s => s.startsWith('refreshToken='));
    const tokenCookie = setCookies.find(s => s.startsWith('token='));
    console.log('-> refreshCookie present?', !!refreshCookie);
    const refreshTokenValue = refreshCookie ? refreshCookie.split(';')[0].split('=')[1] : null;
    console.log('-> extracted refresh token (prefix):', refreshTokenValue ? refreshTokenValue.substring(0, 20) : null);

    // Query DB sessions for this user
    const sessions = await prisma.session.findMany({ where: { userId: u.id } });
    console.log(`\n🔐 Sessions in DB for user ${u.id}: ${sessions.length}`);
    for (const s of sessions) {
      console.log(`- session.id=${s.id} refreshToken(prefix)=${s.refreshToken.substring(0,20)} expiresAt=${s.expiresAt.toISOString()} revoked=${s.revoked}`)
    }

    // Compare cookie token to DB token
    if (refreshTokenValue) {
      const match = sessions.some(s => s.refreshToken === refreshTokenValue);
      console.log('\n🔁 Does cookie refreshToken match any DB session refreshToken? ', match);
    }

    // Try refresh via API using cookie value
    console.log('\n🔁 Calling /api/auth/refresh with refreshToken cookie...');
    const refreshRes = await axios.post('http://localhost:4000/api/auth/refresh', {}, { headers: { Cookie: `refreshToken=${refreshTokenValue}` }, validateStatus: () => true });
    console.log('-> refresh status:', refreshRes.status);
    if (refreshRes.data) console.log('-> refresh response:', refreshRes.data);

    // cleanup
    console.log('\n🧹 Cleaning up...');
    await prisma.session.deleteMany({ where: { userId: u.id } });
    await prisma.userSecurityEvent.deleteMany({ where: { email } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log('✅ Cleanup done');

  } catch (e) {
    console.error('Error during test:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async e => { console.error(e); try{ await prisma.$disconnect(); }catch{}; process.exit(1); });