const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const axios = require('axios');

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const email = `ci-test-login-${ts}@haypbooks.test`;
  const password = 'TestPass123!';
  console.log('\n➡️  Creating test user:', email);

  const hashed = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({ data: { email, password: hashed, name: 'CI Test User', isEmailVerified: true, role: 'owner' } });
  } catch (e) {
    console.error('Failed to create user:', e.message || e);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Try login
  console.log('🔐 Attempting login...');
  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', { email, password }, { validateStatus: () => true });
    console.log('-> login status:', res.status);
    if (res.headers && res.headers['set-cookie']) {
      console.log('-> Set-Cookie headers:', res.headers['set-cookie'].join('\n'));
      // Extract refreshToken cookie
      const refreshCookie = res.headers['set-cookie'].find(s => s.startsWith('refreshToken='));
      const tokenCookie = res.headers['set-cookie'].find(s => s.startsWith('token='));
      if (refreshCookie) {
        const refreshTokenValue = refreshCookie.split(';')[0].split('=')[1];
        console.log('-> Extracted refresh token prefix:', refreshTokenValue.substring(0, 8));

        // Call refresh endpoint using Cookie header
        console.log('\n🔁 Calling /api/auth/refresh with refreshToken cookie...');
        const refreshRes = await axios.post('http://localhost:4000/api/auth/refresh', {}, { headers: { Cookie: `refreshToken=${refreshTokenValue}` }, validateStatus: () => true });
        console.log('-> refresh status:', refreshRes.status);
        if (refreshRes.data) console.log('-> refresh response keys:', Object.keys(refreshRes.data));
      } else {
        console.warn('No refreshToken cookie set on login response.');
      }
    } else {
      console.warn('No Set-Cookie headers found on login response.');
    }
  } catch (e) {
    console.error('Login attempt failed:', e.message || e);
  }

  // Cleanup: delete user and any sessions
  console.log('\n🧹 Cleaning up test user and sessions...');
  try {
    const u = await prisma.user.findUnique({ where: { email } });
    if (u) {
      await prisma.session.deleteMany({ where: { userId: u.id } });
      await prisma.userSecurityEvent.deleteMany({ where: { email } });
      await prisma.user.delete({ where: { id: u.id } });
    }
    console.log('✅ Cleanup complete');
  } catch (e) {
    console.warn('Cleanup error:', e.message || e);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Script error:', e);
  try { await prisma.$disconnect(); } catch (e) {}
  process.exit(1);
});