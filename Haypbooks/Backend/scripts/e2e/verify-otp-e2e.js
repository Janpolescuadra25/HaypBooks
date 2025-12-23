const { PrismaClient } = require('@prisma/client');

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text) } catch (e) { data = text }
  return { status: res.status, data };
}

async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) } } catch (e) { return { status: res.status, data: text } }
}

(async () => {
  try {
    const email = `e2e-verify-${Date.now()}@haypbooks.test`;
    const password = 'verify-pass';
    console.log('Signing up with', email);
    const signupRes = await postJson('http://localhost:4000/api/auth/signup', { email, password, name: 'E2E Verify' });
    console.log('Signup status:', signupRes.status);
    console.log('Signup body:', signupRes.data);

    let otp = signupRes.data?._devOtp;
    if (!otp) {
      console.log('Dev OTP not returned; fetching latest OTP via test endpoint');
      const testRes = await getJson(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`);
      otp = testRes.data?.otpCode || testRes.data?.otp?.otpCode || testRes.data?.otpCode;
      console.log('Test endpoint returned:', testRes.data);
    }

    if (!otp) {
      console.error('No OTP available to verify. Aborting');
      process.exit(2);
    }

    console.log('Using OTP:', otp);
    const verifyRes = await postJson('http://localhost:4000/api/auth/verify-otp', { email, otpCode: otp });
    console.log('Verify status:', verifyRes.status, 'body:', verifyRes.data);

    // Check DB to ensure user is verified
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User record:', { id: user?.id, email: user?.email, isEmailVerified: user?.isEmailVerified });
    await prisma.$disconnect();

    if (user && user.isEmailVerified) {
      console.log('E2E verification succeeded');
      process.exit(0);
    } else {
      console.error('E2E verification FAILED');
      process.exit(3);
    }
  } catch (err) {
    console.error('E2E script error:', err?.response?.data || err.message || err);
    process.exit(1);
  }
})();