import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Accountant full UI flow e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('covers signup -> verify -> login -> invite -> list clients', async () => {
    const email = `ui-acc-${Date.now()}@haypbooks.test`
    const password = 'ui-pass-1A'

    // Signup as accountant
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'UI Accountant', role: 'accountant' }).expect(201)
    expect(signup.body.user.userType).toBe('ACCOUNTANT')

    // Read OTP from DB and verify
    const otpRow = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(otpRow).toBeTruthy()

    const verify = await request(app.getHttpServer()).post('/api/auth/verify-otp').send({ email, otpCode: otpRow!.otpCode }).expect(200)
    expect(verify.body.success).toBe(true)

    // Login
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    expect(login.body).toHaveProperty('token')
    const token = login.body.token
    const userId = login.body.user.id

    // Create tenant as owner directly in DB
    const tenant = await prisma.tenant.create({ data: { name: `UI Tenant ${Date.now()}`, subdomain: `ui-tenant-${Date.now()}` } })

    // Invite via API
    await request(app.getHttpServer()).post('/api/accountants/invite').set('Authorization', `Bearer ${token}`).send({ tenantId: tenant.id, accessLevel: 'FULL' }).expect(201)

    // List clients via API as accountant
    const listResp = await request(app.getHttpServer()).get(`/api/accountants/clients/${userId}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(listResp.body)).toBe(true)
    const found = listResp.body.find((r:any) => r.tenantId === tenant.id)

    // Also verify directly from DB to narrow down the issue
    const dbAc = await prisma.accountantClient.findFirst({ where: { accountantId: userId, tenantId: tenant.id } })
    console.log('DEBUG listResp.body:', listResp.body)
    console.log('DEBUG dbAc:', dbAc)

    expect(dbAc).toBeTruthy()
    expect(found).toBeTruthy()

  }, 40000)
})
