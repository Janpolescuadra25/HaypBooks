import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Companies list API (e2e)', () => {
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

  it('GET /api/companies?filter=owned returns only owned companies', async () => {
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    const demoUser = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    expect(demoUser).toBeTruthy()

    // Create a new tenant and link demo user as owner
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}::uuid, ${'Owned Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt") VALUES (${tenantId}::uuid, ${demoUser!.id}, ${'OWNER'}, ${true}, now()) ON CONFLICT ("tenantId","userId") DO NOTHING`
    // Ensure a Company row exists for this tenant so the companies API returns it
    await prisma.company.create({ data: { workspaceId, name: 'Owned Company', isActive: true } })

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const tenantIds = res.body.map((r: any) => r.workspaceId)
    expect(tenantIds).toContain(tenantId)
  }, 30000)

  it('GET /api/companies?filter=invited returns invited tenants for user email', async () => {
    // Reuse seeded demo user for invited check
    // Ensure prior sessions are cleaned up to avoid duplicate refresh token collisions
    await prisma.session.deleteMany({}).catch(() => {})
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Create a tenant and an invite for demo@haypbooks.test
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}::uuid, ${'Invited Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const inviteId = require('crypto').randomUUID()
    // Ensure invitedBy references a seeded user instead of 'system' to satisfy FK constraints
    const inviter = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    const inviterId = inviter ? inviter.id : null
    // Ensure unique index exists so ON CONFLICT (tenantId,email) works in tests
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "TenantInvite_tenantId_email_uq" ON public."TenantInvite" ("tenantId","email")`
    await prisma.$executeRaw`INSERT INTO public."TenantInvite" ("id","tenantId","email","invitedBy","invitedAt","status") VALUES (${inviteId}, ${tenantId}::uuid, ${'demo@haypbooks.test'}, ${inviterId}, now(), ${'PENDING'}) ON CONFLICT ("tenantId","email") DO NOTHING`
    // Ensure a Company exists for the invited tenant so the API can return it
    await prisma.company.create({ data: { workspaceId, name: 'Invited Company', isActive: true } })

    const res = await request(app.getHttpServer()).get('/api/companies?filter=invited').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const tenantIds = res.body.map((r: any) => r.workspaceId)
    expect(tenantIds).toContain(tenantId)
  }, 30000)

  it('GET /api/companies/:id is scoped to tenant membership', async () => {
    // Create a tenant and company not linked to demo user
    const tenantB = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${tenantB}::uuid, ${'Other Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const companyB = await prisma.company.create({ data: { workspaceId: tenantB, name: 'Other Company', isActive: true } })

    // Demo user should NOT be able to GET this company
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    await request(app.getHttpServer()).get(`/api/companies/${companyB.id}`).set('Authorization', `Bearer ${token}`).expect(404)

    // Now add demo user as a TenantUser and try again → expect 200
    const demoUser = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt") VALUES (${tenantB}::uuid, ${demoUser!.id}, ${'MEMBER'}, ${false}, now()) ON CONFLICT ("tenantId","userId") DO NOTHING`
    const res2 = await request(app.getHttpServer()).get(`/api/companies/${companyB.id}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(res2.body).toBeTruthy()
  }, 30000)

  it('GET /api/companies?filter=owned excludes companies for INACTIVE tenant memberships', async () => {
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}::uuid, ${'Inactive Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const demoUser = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","status","joinedAt") VALUES (${tenantId}::uuid, ${demoUser!.id}, ${'MEMBER'}, ${false}, ${'INACTIVE'}, now()) ON CONFLICT ("tenantId","userId") DO NOTHING`
    await prisma.company.create({ data: { workspaceId, name: 'Inactive Membership Company', isActive: true } })

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const tenantIds = res.body.map((r: any) => r.workspaceId)
    expect(tenantIds).not.toContain(tenantId)
  }, 30000)

  it('GET /api/companies?filter=owned excludes companies for other tenants', async () => {
    // Create a tenant and company not linked to demo user
    const foreignTenant = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","baseCurrency","createdAt","updatedAt") VALUES (${foreignTenant}::uuid, ${'Foreign Tenant'}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const foreignCompany = await prisma.company.create({ data: { workspaceId: foreignTenant, name: 'Foreign Company', isActive: true } })

    // Login as demo user and fetch owned companies
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const ids = (res.body || []).map((r: any) => r.id)
    expect(ids).not.toContain(foreignCompany.id)
  }, 30000)
})
