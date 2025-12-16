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

  it('signup with role=accountant sets userType', async () => {
    const email = `e2e-acc-${Date.now()}@haypbooks.test`
    const password = 'e2e-password'

    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Accountant E2E', role: 'accountant' }).expect(201)
    expect(signup.body).toHaveProperty('token')
    expect(signup.body.user.email).toBe(email)
    expect(signup.body.user.userType).toBe('ACCOUNTANT')

    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect((saved as any).userType).toBe('ACCOUNTANT')
  }, 20000)

  it('accountant can invite a tenant (creates AccountantClient)', async () => {
    // Create a tenant to invite
    const tenant = await prisma.tenant.create({ data: { name: `Tenant ${Date.now()}`, subdomain: `tenant-${Date.now()}` } })

    // Signup as accountant
    const email = `e2e-inviter-${Date.now()}@haypbooks.test`
    const password = 'e2e-password'
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Inviter E2E', role: 'accountant' }).expect(201)
    const token = signup.body.token
    const userId = signup.body.user.id

    // Ensure user exists in DB
    const createdUser = await prisma.user.findUnique({ where: { id: userId } })
    console.log('DEBUG createdUser id:', createdUser?.id, 'userId header value', userId)
    expect(createdUser).toBeTruthy()

    // Use the API invite endpoint (authenticated) to invite the tenant
    await request(app.getHttpServer())
      .post('/api/accountants/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId: tenant.id, accessLevel: 'FULL' })
      .expect(201)

    // Verify DB row created
    const ac = await prisma.accountantClient.findFirst({ where: { accountantId: userId, tenantId: tenant.id } })
    expect(ac).toBeTruthy()
    expect(ac?.status).toBe('ACTIVE')

    // Negative: regular user cannot invite
    const guestEmail = `e2e-guest-${Date.now()}@haypbooks.test`
    const signup2 = await request(app.getHttpServer()).post('/api/auth/signup').send({ email: guestEmail, password, name: 'Guest E2E' }).expect(201)
    const guestToken = signup2.body.token

    await request(app.getHttpServer())
      .post('/api/accountants/invite')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ tenantId: tenant.id, accessLevel: 'FULL' })
      .expect(403)
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

})
