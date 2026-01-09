import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Users profile persistence (e2e)', () => {
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
    // Mirror production bootstrap validation pipe so DTO validation runs in e2e tests
    const { ValidationPipe } = require('@nestjs/common')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
    await prisma.user.deleteMany({ where: { email: { contains: 'profile-e2e' } } }).catch(() => {})
  })

  it('PATCH /api/users/profile updates DB fields companyName and firmName', async () => {
    const email = `profile-e2e-${Date.now()}@haypbooks.test`
    const password = 'ProfileE2E1!'

    // Create a verified user via test endpoint
    await request(app.getHttpServer())
      .post('/api/test/create-user')
      .send({ email, password, name: 'Profile E2E', isEmailVerified: true })
      .expect(201)

    // Login to get token
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body).toHaveProperty('token')
    const token = login.body.token as string

    // Patch profile
    const res = await request(app.getHttpServer())
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: 'Acme Widgets', firmName: 'Rivera CPA' })
      .expect(200)

    expect(res.body).toHaveProperty('companyName', 'Acme Widgets')
    expect(res.body).toHaveProperty('firmName', 'Rivera CPA')

    // Confirm DB persisted
    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect((saved as any).companyName).toBe('Acme Widgets')
    expect((saved as any).firmName).toBe('Rivera CPA')
  }, 30000)

  it('sanitizes (trims) input and converts empty string to null', async () => {
    const email = `profile-e2e-${Date.now()}-trim@haypbooks.test`
    const password = 'ProfileTrim1!'

    await request(app.getHttpServer())
      .post('/api/test/create-user')
      .send({ email, password, name: 'Profile Trim', isEmailVerified: true })
      .expect(201)

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token as string

    // Send with whitespace and empty firmName
    const res = await request(app.getHttpServer())
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: '  Trim Co  ', firmName: '   ' })
      .expect(200)

    expect(res.body.companyName).toBe('Trim Co')
    expect(res.body.firmName).toBeNull()

    const saved = await prisma.user.findUnique({ where: { email } })
    expect((saved as any).companyName).toBe('Trim Co')
    expect((saved as any).firmName).toBeNull()
  }, 30000)

  it('returns 400 for too-long inputs', async () => {
    const email = `profile-e2e-${Date.now()}-long@haypbooks.test`
    const password = 'ProfileLong1!'

    await request(app.getHttpServer())
      .post('/api/test/create-user')
      .send({ email, password, name: 'Profile Long', isEmailVerified: true })
      .expect(201)

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token as string

    const long = 'x'.repeat(500)
    await request(app.getHttpServer())
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: long })
      .expect(400)
  }, 30000)
})
