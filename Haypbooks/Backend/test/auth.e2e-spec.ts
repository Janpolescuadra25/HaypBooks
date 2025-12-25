import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Auth e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    // Use test DB for e2e
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    // Ensure DB exists and run migrations then seed
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    // Start Nest app
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean records for determinism
    await prisma.session.deleteMany({})
    await prisma.otp.deleteMany({})
    await prisma.user.deleteMany({ where: { email: { contains: 'e2e' } } }).catch(() => {})
  })

  it('signup -> login -> session creation', async () => {
    const email = `e2e-${Date.now()}@haypbooks.test`
    const password = 'e2e-password'

    // Signup
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'E2E Test' }).expect(201)
    expect(signup.body).toHaveProperty('token')
    expect(signup.body.user.email).toBe(email)

    // Check user saved in DB
    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()

    // Login
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body).toHaveProperty('token')
    expect(login.body).toHaveProperty('refreshToken')

    // Check session
    const sessions = await prisma.session.findMany({ where: { userId: saved!.id } })
    expect(sessions.length).toBeGreaterThan(0)
  }, 20000)

  it('login redirects accountant to accountant hub', async () => {
    const email = `e2e-acct-login-${Date.now()}@haypbooks.test`
    const password = 'LoginPass123'

    // Signup as accountant
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Acct Login', role: 'accountant' }).expect(201)

    // Login and expect redirect to accountant hub
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body).toHaveProperty('redirect')
    expect(login.body.redirect).toBe('/hub/accountant')
  }, 20000)

  it('signup with existing email returns 409 and proper message (integration)', async () => {
    const email = `e2e-dup-${Date.now()}@haypbooks.test`
    const password = 'DupPass123'

    // First signup should succeed
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Dup E2E' }).expect(201)

    // Second signup with same email should return 409 Conflict
    const resp = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Dup E2E' }).expect(409)
    expect(resp.body).toHaveProperty('message')
    expect(String(resp.body.message).toLowerCase()).toContain('already registered')
  }, 20000)

  it('signup -> verify email OTP -> user verified', async () => {
    const email = `e2e-verify-${Date.now()}@haypbooks.test`
    const password = 'verify-pass'

    // Signup
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Verify E2E' }).expect(201)
    expect(signup.body).toHaveProperty('token')

    // Read verification OTP row
    const otpRow = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(otpRow).toBeTruthy()

    // Verify OTP
    const verify = await request(app.getHttpServer()).post('/api/auth/verify-otp').send({ email, otpCode: otpRow!.otpCode }).expect(200)
    expect(verify.body.success).toBe(true)

    // Check user flag
    const user = await prisma.user.findUnique({ where: { email } })
    expect(user).toBeTruthy()
    expect((user as any).isEmailVerified).toBe(true)
  }, 20000)

  it('signup/login include pin flags and pin setup toggles flags', async () => {
    const email = `e2e-pin-${Date.now()}@haypbooks.test`
    const password = 'PinPass123'

    // Signup
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Pin E2E' }).expect(201)
    expect(signup.body.user).toHaveProperty('hasPin')
    expect(signup.body.user.hasPin).toBe(false)
    expect(signup.body.user.pinSetAt).toBeNull()

    // Login
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body.user.requiresPinSetup).toBe(true)
    const token = login.body.token

    // Setup PIN
    const setup = await request(app.getHttpServer()).post('/auth/pin/setup').set('Authorization', `Bearer ${token}`).send({ pin: '111111', pinConfirm: '111111' }).expect(201)
    expect(setup.body).toHaveProperty('pinSetAt')
    // New: ensure setup explicitly returns hasPin
    expect(setup.body).toHaveProperty('hasPin')
    expect(setup.body.hasPin).toBe(true)

    // GET /api/users/me should include hasPin true and pinSetAt not null
    const me = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200)
    expect(me.body).toHaveProperty('id')
    expect(me.body).toHaveProperty('hasPin')
    expect(me.body.hasPin).toBe(true)
    expect(me.body.pinSetAt).not.toBeNull()

    // Logging in again should not require setup
    const login2 = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login2.body.user.requiresPinSetup).toBe(false)
  }, 30000)

  it('GET /api/auth/verify-email sets session cookies when ENABLE_AUTO_VERIFY_LOGIN=true', async () => {
    process.env.ENABLE_AUTO_VERIFY_LOGIN = 'true'

    // Start a fresh app so env var takes effect
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile()
    const app2 = moduleFixture.createNestApplication()
    await app2.init()

    try {
      const email = `e2e-auto-${Date.now()}@haypbooks.test`
      const password = 'auto-pass'
      await request(app2.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Auto E2E' }).expect(201)

      const otpRow = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
      expect(otpRow).toBeTruthy()

      const res = await request(app2.getHttpServer()).get(`/api/auth/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpRow!.otpCode)}`).expect(302)
      const setCookie = res.headers['set-cookie'] || []
      const cookiesArr = Array.isArray(setCookie) ? setCookie : [setCookie]
      const joint = cookiesArr.join(' ')
      expect(joint).toMatch(/token=/)
      expect(joint).toMatch(/refreshToken=/)
    } finally {
      await app2.close()
      delete process.env.ENABLE_AUTO_VERIFY_LOGIN
    }
  }, 40000)

  it('forgot -> verify -> reset flows', async () => {
    const email = `e2e-reset-${Date.now()}@haypbooks.test`
    const password = 'original-pass'

    // Create user directly
    const user = await prisma.user.create({ data: { email, password: await require('bcrypt').hash(password, 10), name: 'Reset E2E' } })

    // Trigger forgot-password -> creates OTP
    await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email }).expect(200)

    // Read OTP from DB
    const otpRow = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(otpRow).toBeTruthy()

    // Verify OTP
    const verify = await request(app.getHttpServer()).post('/api/auth/verify-otp').send({ email, otpCode: otpRow!.otpCode }).expect(200)
    expect(verify.body.success).toBe(true)

    // For RESET purpose, verify-otp does not delete the OTP because the reset flow
    // does a verification+consume at the final reset step. Confirm the row still exists.
    const afterVerify = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(afterVerify).toBeTruthy()

    // Create a new OTP, then reset password using reset endpoint
    await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email }).expect(200)
    const otpRow2 = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(otpRow2).toBeTruthy()

    const newPassword = 'NewPass123'
    await request(app.getHttpServer()).post('/api/auth/reset-password').send({ email, otpCode: otpRow2!.otpCode, password: newPassword }).expect(200)

    // Verify new password works
    await request(app.getHttpServer()).post('/api/auth/login').send({ email, password: newPassword }).expect(200)
  }, 30000)

  it('logs security events on signup/login and exposes them', async () => {
    const email = `e2e-sechevents-${Date.now()}@haypbooks.test`
    const password = 'Pass1234'

    // signup
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'E2E Sec' }).expect(201)
    // login
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token || login.body.accessToken || login.body.accessToken

    // fetch security events
    const resp = await request(app.getHttpServer()).get('/api/auth/security-events').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(resp.body)).toBe(true)
    expect(resp.body.length).toBeGreaterThanOrEqual(1)
    expect(resp.body[0]).toHaveProperty('createdAt')
  }, 20000)

  it('signup as accountant persists isAccountant and preferredHub', async () => {
    const email = `e2e-acct-${Date.now()}@haypbooks.test`
    const password = 'Pass1234'

    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Acct E2E', firstName: 'A', lastName: 'C', companyName: 'Acct Firm', role: 'accountant' }).expect(201)
    expect(signup.body).toHaveProperty('token')

    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect((saved as any).isAccountant).toBe(true)
    expect((saved as any).preferredHub).toBe('ACCOUNTANT')
  }, 20000)

  it('PATCH /api/users/preferred-hub updates preferredHub', async () => {
    const email = `e2e-pref-${Date.now()}@haypbooks.test`
    const password = 'Pass1234'

    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Pref E2E' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    await request(app.getHttpServer()).patch('/api/users/preferred-hub').set('Authorization', `Bearer ${token}`).send({ preferredHub: 'ACCOUNTANT' }).expect(200)

    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect((saved as any).preferredHub).toBe('ACCOUNTANT')
  }, 20000)

  it('POST /api/onboarding/complete sets owner/accountant onboarding flags', async () => {
    const email = `e2e-onb-${Date.now()}@haypbooks.test`
    const password = 'Pass1234'

    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Onb E2E' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token

    // Mark owner onboarding complete
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'OWNER' }).expect(200)
    let saved = await prisma.user.findUnique({ where: { email } })
    expect((saved as any).ownerOnboardingComplete || (saved as any).onboardingComplete).toBeTruthy()

    // Create a second user for accountant
    const email2 = `e2e-onb-acct-${Date.now()}@haypbooks.test`
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email: email2, password, name: 'Acct Onb', role: 'accountant' }).expect(201)
    const login2 = await request(app.getHttpServer()).post('/api/auth/login').send({ email: email2, password }).expect(200)
    const token2 = login2.body.token

    // Mark accountant onboarding complete
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token2}`).send({ type: 'full', hub: 'ACCOUNTANT' }).expect(200)
    const savedAccountant = await prisma.user.findUnique({ where: { email: email2 } })
    expect(savedAccountant).toBeTruthy()
    expect((savedAccountant as any).accountantOnboardingComplete || (savedAccountant as any).onboardingComplete).toBeTruthy()
  }, 20000)

})
