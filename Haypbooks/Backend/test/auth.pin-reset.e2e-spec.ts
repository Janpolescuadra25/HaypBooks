import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('PIN Reset endpoints removed; email verification still works', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env } })

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
    await prisma.user.deleteMany({ where: { email: { contains: 'e2e' } } }).catch(() => {})
  })

  it('email verification works and pin endpoints are not present', async () => {
    const email = `pin-reset-${Date.now()}@haypbooks.test`
    const password = 'ResetPass!23'

    // Signup and login
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Reset PIN User', phone: '+1 555 000 0000' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token

    // Trigger reset: send verification (dev returns otp when NODE_ENV != production)
    const sendRes = await request(app.getHttpServer()).post('/api/auth/send-verification').send({ email }).expect(200)
    // Either response contains otp (dev) or we read from DB
    let otp = sendRes.body.otp
    if (!otp) {
      const row = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
      expect(row).toBeTruthy()
      otp = row!.otpCode
    }

    expect(otp).toHaveLength(6)

    // Verify via email/verify-code
    const verify = await request(app.getHttpServer()).post('/api/auth/email/verify-code').send({ email, code: otp })
    expect(verify.status).toBeLessThan(400)
    expect(verify.body.success).toBeTruthy()

    // Confirm that PIN endpoints return 404
    await request(app.getHttpServer()).post('/api/auth/pin/setup').set('Authorization', `Bearer ${token}`).send({ pin: '303030', pinConfirm: '303030' }).expect(404)
    await request(app.getHttpServer()).post('/api/auth/pin/verify').set('Authorization', `Bearer ${token}`).send({ pin: '303030' }).expect(404)
  }, 30000)
})