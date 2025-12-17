import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Companies e2e', () => {
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

  it('creates tenant user entry on last-accessed (upsert) and lists companies for user', async () => {
    // Create a user and a tenant, and link them via upsert when switching
    const user = await prisma.user.create({ data: { email: `e2e-${Date.now()}@hb.test`, password: 'x', name: 'E2E' } })
    const tenant = await prisma.tenant.create({ data: { name: 'Acme Test' } })

    // Create a session token via auth service or sign JWT manually via test helper
    // For simplicity, use auth signup endpoint to get a token
    const signupResp = await request(app.getHttpServer()).post('/api/auth/signup').send({ email: user.email, password: 'Pass1234', name: 'E2E' }).expect(201)
    const token = signupResp.body.token

    // Initially list companies (should not include a newly created tenant)
    const listBefore = await request(app.getHttpServer()).get('/api/companies').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(listBefore.body)).toBe(true)

    // Patch last-accessed for the created tenant
    await request(app.getHttpServer()).patch(`/api/companies/${tenant.id}/last-accessed`).set('Authorization', `Bearer ${token}`).expect(201)

    // Confirm tenantUser upserted
    const tu = await prisma.tenantUser.findUnique({ where: { tenantId_userId: { tenantId: tenant.id, userId: signupResp.body.user.id } } })
    expect(tu).toBeTruthy()
    expect(tu!.lastAccessedAt).toBeTruthy()
  }, 20000)
})
