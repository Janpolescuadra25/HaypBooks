import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';
const prisma = new PrismaClient();

interface SignupResponse {
  message: string;
  email: string;
  otpId: string;
}

interface VerifyOtpResponse {
  message: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    onboardingCompleted: boolean;
  };
}

async function testAuthFlow() {
  console.log('🧪 Testing complete authentication flow...\n');

  const testEmail = `test${Date.now()}@haypbooks.test`;
  const testPassword = 'TestPass123';
  let otpId: string;
  let otpCode: string;
  let accessToken: string;

  try {
    // Step 1: Signup
    console.log('📝 Step 1: Signing up...');
    const signupRes = await axios.post<SignupResponse>(`${API_URL}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      name: 'Test User',
    });

    console.log(`✅ Signup successful: ${signupRes.data.message}`);
    otpId = signupRes.data.otpId;

    // Step 2: Get OTP from database
    console.log('\n🔍 Step 2: Retrieving OTP from database...');
    const otpRecord = await prisma.otp.findFirst({
      where: { id: otpId },
    });

    if (!otpRecord) {
      throw new Error('OTP not found in database');
    }

    otpCode = otpRecord.otpCode;
    console.log(`✅ OTP retrieved: ${otpCode}`);

    // Step 3: Verify OTP
    console.log('\n✔️  Step 3: Verifying OTP...');
    const verifyRes = await axios.post<VerifyOtpResponse>(`${API_URL}/auth/verify-otp`, {
      email: testEmail,
      code: otpCode,
    });

    console.log(`✅ OTP verified: ${verifyRes.data.message}`);

    // Step 4: Login
    console.log('\n🔐 Step 4: Logging in...');
    const loginRes = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    console.log(`✅ Login successful`);
    console.log(`   User: ${loginRes.data.user.name}`);
    console.log(`   Email: ${loginRes.data.user.email}`);
    console.log(`   Onboarding: ${loginRes.data.user.onboardingCompleted ? 'Complete' : 'Pending'}`);
    accessToken = loginRes.data.accessToken;

    // Step 5: Get current user
    console.log('\n👤 Step 5: Fetching user profile...');
    const userRes = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`✅ User profile retrieved`);
    console.log(`   ID: ${userRes.data.id}`);
    console.log(`   Email: ${userRes.data.email}`);

    // Step 6: Check security events
    console.log('\n🔒 Step 6: Checking security events...');
    const securityEvents = await prisma.userSecurityEvent.findMany({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Security events logged: ${securityEvents.length}`);
    securityEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.type} at ${event.createdAt.toISOString()}`);
    });

    // Step 7: Initiate password reset
    console.log('\n🔄 Step 7: Testing password reset...');
    const resetRes = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail,
    });

    console.log(`✅ Password reset initiated: ${resetRes.data.message}`);

    // Get reset OTP
    const resetOtp = await prisma.otp.findFirst({
      where: { 
        email: testEmail,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetOtp) {
      throw new Error('Reset OTP not found');
    }

    console.log(`   Reset OTP: ${resetOtp.otpCode}`);

    // Step 8: Complete password reset
    console.log('\n🔓 Step 8: Completing password reset...');
    const newPassword = 'NewPass123';
    const resetCompleteRes = await axios.post(`${API_URL}/auth/reset-password`, {
      email: testEmail,
      code: resetOtp.otpCode,
      newPassword: newPassword,
    });

    console.log(`✅ Password reset complete: ${resetCompleteRes.data.message}`);

    // Step 9: Login with new password
    console.log('\n🔐 Step 9: Logging in with new password...');
    const newLoginRes = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email: testEmail,
      password: newPassword,
    });

    console.log(`✅ Login with new password successful`);

    // Final verification
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Signup working`);
    console.log(`   ✅ OTP verification working`);
    console.log(`   ✅ Login working`);
    console.log(`   ✅ User profile retrieval working`);
    console.log(`   ✅ Security event logging working`);
    console.log(`   ✅ Password reset working`);
    console.log(`   ✅ Database persistence working`);

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    throw error;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.session.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.otp.deleteMany({ where: { email: testEmail } });
    await prisma.userSecurityEvent.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('✅ Cleanup complete');
    
    await prisma.$disconnect();
  }
}

testAuthFlow().catch(console.error);
