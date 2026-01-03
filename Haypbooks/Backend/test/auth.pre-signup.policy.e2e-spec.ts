import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import * as bcrypt from '../src/utils/bcrypt-fallback'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Auth pre-signup policy (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

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
    await prisma.session.deleteMany({})
    await prisma.otp.deleteMany({})
    await prisma.user.deleteMany({ where: { email: { contains: 'presignup-e2e' } } }).catch(() => {})
  })

  it('does not create DB user until at least one required OTP verified (email OR phone when phone provided)', async () => {
    const email = `presignup-e2e-${Date.now()}@haypbooks.test`
    const password = 'PreSignupPass1!'
    const phone = '+15550001234'

    // Start pending signup
    const pre = await request(app.getHttpServer())
      .post('/api/auth/pre-signup')
      .send({ email, password, name: 'PreSignup E2E', phone })
      .expect(200)

    expect(pre.body).toHaveProperty('signupToken')
    const signupToken = pre.body.signupToken as string

    // No DB user should exist yet
    const beforeUser = await prisma.user.findUnique({ where: { email } })
    expect(beforeUser).toBeNull()

    // Read OTP rows created by pre-signup
    const emailOtp = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(emailOtp).toBeTruthy()
    const phoneOtp = await prisma.otp.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' } })
    expect(phoneOtp).toBeTruthy()

    // Step 1: verify email OTP -> completes under OR policy
    const step1 = await request(app.getHttpServer())
      .post('/api/auth/complete-signup')
      .send({ signupToken, code: emailOtp!.otpCode, method: 'email' })
      .expect(200)

    expect(step1.body).toHaveProperty('token')
    expect(step1.body.token).toBeTruthy()

    const created = await prisma.user.findUnique({ where: { email } })
    expect(created).toBeTruthy()
    expect((created as any).isEmailVerified).toBe(true)
    expect((created as any).phone).toBe(phone)
    expect((created as any).isPhoneVerified).toBe(false)

    // Now login succeeds
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body).toHaveProperty('token')
    expect(login.body).toHaveProperty('refreshToken')
  }, 30000)

  it('enforces verified email/phone on login (e2e, OR policy)', async () => {
    const email = `presignup-e2e-login-${Date.now()}@haypbooks.test`
    const password = 'LoginPolicy1!'
    const hashed = await bcrypt.hash(password, 10)

    // Case 1: email not verified -> login must fail
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: 'Login Policy E2E',
        role: 'owner',
        isEmailVerified: false,
        phone: null,
        isPhoneVerified: false,
      } as any,
    })
    await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(401)

    // Case 2: phone exists but neither verified -> login must fail
    const phone = '+15550007777'
    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: false, phone, isPhoneVerified: false } as any,
    })
    await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(401)

    // Case 3: email verified (phone not verified) -> login succeeds
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true, isPhoneVerified: false } as any })
    const ok1 = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(ok1.body).toHaveProperty('token')
    expect(ok1.body).toHaveProperty('refreshToken')

    // Case 4: phone verified (email not verified) -> login succeeds
    await prisma.user.update({ where: { email }, data: { isEmailVerified: false, isPhoneVerified: true } as any })
    const ok2 = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(ok2.body).toHaveProperty('token')
    expect(ok2.body).toHaveProperty('refreshToken')
  }, 30000)
})
