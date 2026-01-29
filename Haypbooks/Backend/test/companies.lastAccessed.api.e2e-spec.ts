
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Companies lastAccessed API (e2e)', () => {
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

  it('PATCH /api/companies/:id/last-accessed updates tenantUser.lastAccessedAt for the logged-in user', async () => {
    // Login as demo user
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Find demo company
    const tenant = await prisma.workspace.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()
    // Try to find a company row for the demo workspace using raw SQL (avoids Prisma schema mismatch)
    let companyRows: any[] = await prisma.$queryRaw`SELECT id, name FROM public."Company" WHERE "tenantId" = ${tenant!.id}::uuid LIMIT 1`
    if (!companyRows || !companyRows.length) {
      const id = 'company-' + tenant!.id
      await prisma.$executeRaw`INSERT INTO public."Company" ("id","name","tenantId") VALUES (${id}, ${'Demo Company'}, ${tenant!.id}::uuid) ON CONFLICT ("id") DO NOTHING`
      companyRows = await prisma.$queryRaw`SELECT id, name FROM public."Company" WHERE "id" = ${id} LIMIT 1`
    }
    const company = companyRows && companyRows.length ? companyRows[0] : undefined
    expect(company).toBeTruthy()

    // Ensure there is a tenantUser row for demo user
    const user = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    expect(user).toBeTruthy()
    const tuBefore = await prisma.tenantUser.findFirst({ where: { workspaceId: tenant!.id, userId: user!.id } })
    expect(tuBefore).toBeTruthy()

    // Call the API to patch last accessed for the company
    await request(app.getHttpServer()).patch(`/api/companies/${company!.id}/last-accessed`).set('Authorization', `Bearer ${token}`).expect(200)

    // Verify TenantUser.lastAccessedAt was updated
    const tuAfter = await prisma.tenantUser.findFirst({ where: { workspaceId: tenant!.id, userId: user!.id } })
    expect(tuAfter).toBeTruthy()
    expect(tuAfter!.lastAccessedAt).toBeTruthy()
    const beforeTs = tuBefore!.lastAccessedAt ? new Date(tuBefore!.lastAccessedAt).getTime() : 0
    expect(new Date(tuAfter!.lastAccessedAt!).getTime()).toBeGreaterThanOrEqual(beforeTs)
  }, 20000)
})
