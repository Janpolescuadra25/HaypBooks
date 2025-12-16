import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Accountant onboarding smoke e2e', () => {
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

  it('signup as accountant -> invite a tenant end-to-end', async () => {
    // Signup as accountant
    const email = `smoke-acc-${Date.now()}@haypbooks.test`
    const password = 'smoke-pass'

    const signup = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password, name: 'Smoke Accountant', role: 'accountant' })
      .expect(201)

    expect(signup.body.user.userType).toBe('ACCOUNTANT')
    const token = signup.body.token
    const userId = signup.body.user.id

    // Create a tenant to invite
    const tenant = await prisma.tenant.create({ data: { name: `Smoke Tenant ${Date.now()}`, subdomain: `smoke-tenant-${Date.now()}` } })

    // Use invite API
    await request(app.getHttpServer())
      .post('/api/accountants/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId: tenant.id, accessLevel: 'FULL' })
      .expect(201)

    const ac = await prisma.accountantClient.findFirst({ where: { accountantId: userId, tenantId: tenant.id } })
    expect(ac).toBeTruthy()
    expect(ac?.status).toBe('ACTIVE')
  }, 30000)
})
