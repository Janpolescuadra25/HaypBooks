import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

describe('Owner Workspace per-user company visibility (e2e)', () => {
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

  it('creates a user+company via test endpoints and sees the company in /api/companies?filter=owned', async () => {
    const s = Math.random().toString(36).slice(2, 8)
    const email = `owner-workspace-${s}@example.test`
    const password = 'password'
    const companyName = `Owned Company E2E ${s}`

    // Create user via test helper
    const createdUser = await request(app.getHttpServer()).post('/api/test/create-user').send({ email, password, name: 'Owner Workspace User', isEmailVerified: true }).expect(201)
    expect(createdUser.body.email).toBe(email)

    // Use test helper to create company (will create a tenant and link user as owner)
    const createdCompany = await request(app.getHttpServer()).post('/api/test/create-company').send({ email, name: companyName }).expect(201)
    expect(createdCompany.body.created).toBe(true)
    const company = createdCompany.body.company
    expect(company).toBeTruthy()
    expect(company.name).toBe(companyName)

    // Login as created user
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Fetch owned companies and assert the created company is present
    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const found = res.body.find((c: any) => c.name === companyName || c.id === company.id)
    expect(found).toBeTruthy()

    // Create a company for a separate tenant and ensure it is NOT returned
    const otherTenantId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${otherTenantId}::uuid, ${'Foreign Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const foreignCompany = await prisma.company.create({ data: { tenantId: otherTenantId, name: `Foreign Company E2E ${s}`, isActive: true } })

    const res2 = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const ids = (res2.body || []).map((r: any) => r.id)
    // The foreign company should not be visible to the newly created owner user
    expect(ids).not.toContain(foreignCompany.id)
  }, 30000)
})
