import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Onboarding save + complete required fields (e2e)', () => {
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
    await prisma.user.deleteMany({ where: { email: { contains: 'onb-e2e' } } }).catch(() => {})
    await prisma.onboardingStep.deleteMany({})
  })

  it('OWNER onboarding requires companyName; save step then complete persists to user', async () => {
    const email = `onb-e2e-owner-${Date.now()}@haypbooks.test`
    const password = 'OnbOwner1!'

    // Create a verified user via test helper and login
    await request(app.getHttpServer()).post('/api/test/create-user').send({ email, password, name: 'Owner Onb', isEmailVerified: true }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token as string

    // Attempt to complete without saving companyName should fail
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'OWNER' }).expect(400)

    // Save business step and then complete
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'business', data: { companyName: 'OwnerCo LLC' } }).expect((res) => { if (res.status < 200 || res.status >= 300) throw new Error('onboarding save failed: ' + res.status) })
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'OWNER' }).expect(200)

    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect(saved?.companyName).toBe('OwnerCo LLC')
    expect((saved as any).ownerOnboardingComplete || saved?.onboardingComplete).toBeTruthy()
  }, 30000)

  it('ACCOUNTANT onboarding requires firmName; save step then complete persists to user', async () => {
    const email = `onb-e2e-acct-${Date.now()}@haypbooks.test`
    const password = 'OnbAcct1!'

    // Create a verified accountant user via test helper and login
    await request(app.getHttpServer()).post('/api/test/create-user').send({ email, password, name: 'Acct Onb', role: 'accountant', isEmailVerified: true }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token as string

    // Attempt to complete without saving firmName should fail
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'ACCOUNTANT' }).expect(400)

    // Save accountant firm step and then complete
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'accountant_firm', data: { firmName: 'Ledger CPA' } }).expect((res) => { if (res.status < 200 || res.status >= 300) throw new Error('onboarding save failed: ' + res.status) })
    await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'ACCOUNTANT' }).expect(200)

    const saved = await prisma.user.findUnique({ where: { email } })
    expect(saved).toBeTruthy()
    expect(saved?.firmName).toBe('Ledger CPA')
    expect((saved as any).accountantOnboardingComplete || saved?.onboardingComplete).toBeTruthy()
  }, 30000)

})
