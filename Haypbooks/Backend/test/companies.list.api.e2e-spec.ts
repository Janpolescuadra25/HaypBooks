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
    const sub = `owned-${Math.random().toString(36).slice(2,6)}`
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","subdomain","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}, ${'Owned Tenant'}, ${sub}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    await prisma.$executeRaw`INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt") VALUES (${tenantId}, ${demoUser!.id}, ${'OWNER'}, ${true}, now()) ON CONFLICT ("tenantId","userId") DO NOTHING`

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const ids = res.body.map((r: any) => r.id)
    expect(ids).toContain(tenantId)
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
    const sub = `invited-${Math.random().toString(36).slice(2,6)}`
    await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","name","subdomain","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}, ${'Invited Tenant'}, ${sub}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO NOTHING`
    const inviteId = require('crypto').randomUUID()
    // Ensure invitedBy references a seeded user instead of 'system' to satisfy FK constraints
    const inviter = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    const inviterId = inviter ? inviter.id : null
    await prisma.$executeRaw`INSERT INTO public."TenantInvite" ("id","tenantId","email","invitedBy","invitedAt","status") VALUES (${inviteId}, ${tenantId}, ${'demo@haypbooks.test'}, ${inviterId}, now(), ${'PENDING'}) ON CONFLICT ("tenantId","email") DO NOTHING`

    const res = await request(app.getHttpServer()).get('/api/companies?filter=invited').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const ids = res.body.map((r: any) => r.id)
    expect(ids).toContain(tenantId)
  }, 30000)
})
