import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Tenant Invite accept flow (e2e)', () => {
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

  it('accepting an invite sets user.isAccountant if role is Accountant and creates TenantUser', async () => {
    // Prepare: create an 'Accountant' role on demo tenant
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()

    // Create role if missing
    let acctRole = await prisma.role.findFirst({ where: { tenantId: tenant!.id, name: 'Accountant' } })
    if (!acctRole) {
      acctRole = await prisma.role.create({ data: { tenantId: tenant!.id, name: 'Accountant' } })
    }

    // Create an invite for a new user email
    const email = `acct-accept-${Date.now()}@haypbooks.test`
    const invite = await prisma.tenantInvite.create({ data: { tenantId: tenant!.id, email, roleId: acctRole.id, invitedBy: (await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } }))!.id } })

    // Create user via test endpoint
    const create = await request(app.getHttpServer()).post('/api/test/create-user').send({ email, password: 'Password1!', isEmailVerified: true })
    expect([200, 201]).toContain(create.status)

    // Login as the new user
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password: 'Password1!' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Accept the invite
    const accept = await request(app.getHttpServer()).post(`/api/companies/invites/${invite.id}/accept`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(accept.body?.success).toBe(true)
    expect(accept.body?.redirect).toBe('/hub/accountant')

    // DB: user should now be marked as accountant and have TenantUser membership
    const user = await prisma.user.findUnique({ where: { email } })
    expect(user).toBeTruthy()
    expect(user!.isAccountant).toBe(true)

    const tu = await prisma.tenantUser.findUnique({ where: { tenantId_userId: { tenantId: tenant!.id, userId: user!.id } } })
    expect(tu).toBeTruthy()
    expect(tu!.status).toBe('ACTIVE')
  }, 20000)
})
