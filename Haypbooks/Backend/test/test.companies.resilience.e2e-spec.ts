import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Test endpoint resilience: GET /api/test/companies (e2e)', () => {
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

  it('handles companies with NULL name without 500', async () => {
    // create a tenant and associate demo user
    const tenantId = require('crypto').randomUUID()
    const testEmail = `resilience-${Date.now()}@haypbooks.test`
    const createdUser = await prisma.user.create({ data: { email: testEmail, password: 'test-pass', name: 'Resilience Test', isEmailVerified: true } })
    // create tenant and associate the test user
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}::uuid, ${'Resilience Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    try {
      await prisma.$executeRawUnsafe(`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt") VALUES ($1::uuid, $2, $3, $4, now())`, tenantId, createdUser.id, 'OWNER', true)
    } catch (e) {
      // best-effort insert; ignore if it fails (unique constraint or other schema differences)
    }

    // allow nullable name temporarily and insert a company with NULL name via raw SQL (bypass Prisma validation)
    try {
      await prisma.$executeRaw`ALTER TABLE public."Company" ALTER COLUMN "name" DROP NOT NULL`
    } catch (e) {
      // ignore if cannot alter - test DB may already have nullable name
    }
    const companyId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe(`INSERT INTO public."Company" ("id","tenantId","name","isActive","createdAt") VALUES ($1::uuid, $2::uuid, NULL, true, now())`, companyId, tenantId)

    // call test endpoint without auth and expect it returns the company row (no 500s)
    const res = await request(app.getHttpServer()).get(`/api/test/companies?email=${testEmail}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const ids = res.body.map((r: any) => r.id)
    expect(ids).toContain(companyId)

    // cleanup
    await prisma.company.delete({ where: { id: companyId } }).catch(() => {})
  }, 30000)
})
