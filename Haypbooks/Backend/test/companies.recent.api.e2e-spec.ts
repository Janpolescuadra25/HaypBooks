import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Companies recent API (e2e)', () => {
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

  it('GET /api/companies/recent returns companies ordered by lastAccessedAt and updates after visit', async () => {
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Get demo tenant and company
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()

    // Ensure a demo company exists for demo tenant (insert raw if needed)
    let demoCompanyRows: any[] = await prisma.$queryRaw`SELECT id FROM public."Company" WHERE "tenantId" = ${tenant!.id} LIMIT 1`
    if (!demoCompanyRows || !demoCompanyRows.length) {
      await prisma.$executeRaw`INSERT INTO public."Company" ("id","name","tenantId") VALUES (${ 'company-' + tenant!.id }, ${'Demo Company'}, ${tenant!.id}) ON CONFLICT ("id") DO NOTHING`
      demoCompanyRows = await prisma.$queryRaw`SELECT id FROM public."Company" WHERE "id" = ${ 'company-' + tenant!.id } LIMIT 1`
    }
    const demoCompany = demoCompanyRows[0]

    // Create a second tenant and company, and set its tenantUser.lastAccessedAt to a day ago
    const secondTenantId = require('crypto').randomUUID()
    const secondSub = `second-${Math.random().toString(36).slice(2,6)}`
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","subdomain","baseCurrency","createdAt","updatedAt") VALUES (${secondTenantId}, ${'Second Tenant'}, ${secondSub}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const secondCompanyId = 'company-' + secondTenantId
    await prisma.$executeRaw`INSERT INTO public."Company" ("id","name","tenantId") VALUES (${secondCompanyId}, ${'Second Company'}, ${secondTenantId}) ON CONFLICT ("id") DO NOTHING`

    // Link demo user to second tenant with an older lastAccessedAt
    const user = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    expect(user).toBeTruthy()
    const oldDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt","lastAccessedAt") VALUES (${secondTenantId}, ${user!.id}, ${'ADMIN'}, ${false}, now(), ${oldDate}) ON CONFLICT ("tenantId","userId") DO UPDATE SET "lastAccessedAt" = EXCLUDED."lastAccessedAt"`

    // Call recent API and assert ordering (demo tenant should be first because seeded with now())
    const res1 = await request(app.getHttpServer()).get('/api/companies/recent').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res1.body)).toBe(true)
    // Find positions for demo and second
    const ids = res1.body.map((r: any) => r.id)
    const demoIdx = ids.indexOf(tenant!.id)
    const secondIdx = ids.indexOf(secondTenantId)
    expect(demoIdx).toBeGreaterThanOrEqual(0)
    expect(secondIdx).toBeGreaterThanOrEqual(0)
    expect(demoIdx).toBeLessThan(secondIdx)

    // Visit second company (PATCH endpoint) to update lastAccessed
    await request(app.getHttpServer()).patch(`/api/companies/${secondCompanyId}/last-accessed`).set('Authorization', `Bearer ${token}`).expect(200)

    // Re-fetch recent list and assert second tenant is now first
    const res2 = await request(app.getHttpServer()).get('/api/companies/recent').set('Authorization', `Bearer ${token}`).expect(200)
    const ids2 = res2.body.map((r: any) => r.id)
    expect(ids2[0]).toBe(secondTenantId)
  }, 30000)
})
