const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const axios = require('axios');

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const email = `ci-debug-login2-${ts}@haypbooks.test`;
  const password = 'TestPass123!';
  console.log('\n➡️  Creating test user:', email);

  const hashed = await bcrypt.hash(password, 10);
  try {
    const u = await prisma.user.create({ data: { email, password: hashed, name: 'CI Debug User 2', isEmailVerified: true, role: 'owner' } });
    // login
    console.log('🔐 Attempting login...');
    const res = await axios.post('http://localhost:4000/api/auth/login', { email, password }, { validateStatus: () => true });
    console.log('-> login status:', res.status);
    const setCookies = res.headers['set-cookie'] || [];
    const refreshCookie = setCookies.find(s => s.startsWith('refreshToken='));
    const tokenCookie = setCookies.find(s => s.startsWith('token='));
    const refreshTokenValue = refreshCookie ? refreshCookie.split(';')[0].split('=')[1] : null;
    const tokenValue = tokenCookie ? tokenCookie.split(';')[0].split('=')[1] : null;

    console.log('\n-> token prefix:', tokenValue ? tokenValue.substring(0, 20) : null);
    console.log('-> refresh prefix:', refreshTokenValue ? refreshTokenValue.substring(0, 20) : null);

    // Call /api/auth/sessions using both cookies
    console.log('\n📋 Calling GET /api/auth/sessions with both cookies...')
    const sessionsRes = await axios.get('http://localhost:4000/api/auth/sessions', { headers: { Cookie: `token=${tokenValue}; refreshToken=${refreshTokenValue}` }, validateStatus: () => true });
    console.log('-> sessions status:', sessionsRes.status);
    if (sessionsRes.data) console.log('-> sessions body keys:', Object.keys(sessionsRes.data));
    console.log('-> sessions body (preview):', JSON.stringify(sessionsRes.data).slice(0,400));

    // Try refresh
    console.log('\n🔁 Calling /api/auth/refresh with refreshToken cookie...');
    // Try refresh via API using body fallback (dev-only) to avoid SameSite cookie issues
    const refreshRes = await axios.post('http://localhost:4000/api/auth/refresh', { refreshToken: refreshTokenValue }, { headers: { Cookie: `token=${tokenValue}` }, validateStatus: () => true });
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