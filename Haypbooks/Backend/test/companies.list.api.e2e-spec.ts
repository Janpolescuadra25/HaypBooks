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

    // Ensure the Workspace table exists in test schema (some setups may skip this model)
    const workspaceTable = await prisma.$queryRawUnsafe<Array<{table_name: string}>>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Workspace'
    `)
    if (!workspaceTable || workspaceTable.length === 0) {
      console.log('Workspace table missing in test DB; creating minimal Workspace table for test coverage')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE public."Workspace" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "ownerUserId" text NOT NULL UNIQUE,
          "type" text NOT NULL DEFAULT 'OWNER',
          "status" text NOT NULL DEFAULT 'ACTIVE',
          "baseCurrency" text NOT NULL DEFAULT 'USD',
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now(),
          "deletedAt" timestamptz
        );
      `)
    }

    // Ensure the Tenant tables exist for tenant-based test scenarios
    const tenantTable = await prisma.$queryRawUnsafe<Array<{table_name: string}>>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Tenant'
    `)
    if (!tenantTable || tenantTable.length === 0) {
      console.log('Tenant table missing in test DB; creating minimal Tenant and TenantUser tables for test coverage')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE public."Tenant" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" text NOT NULL,
          "baseCurrency" text NOT NULL DEFAULT 'USD',
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `)
      await prisma.$executeRawUnsafe(`
        CREATE TABLE public."TenantUser" (
          "tenantId" uuid NOT NULL,
          "userId" text NOT NULL,
          "role" text,
          "isOwner" boolean DEFAULT false,
          "joinedAt" timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY ("tenantId", "userId"),
          FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE
        );
      `)

      const tenantInviteTable = await prisma.$queryRawUnsafe<Array<{table_name: string}>>(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'TenantInvite'
      `)
      if (!tenantInviteTable || tenantInviteTable.length === 0) {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE public."TenantInvite" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "tenantId" uuid NOT NULL,
            "email" text NOT NULL,
            "invitedBy" text,
            "invitedAt" timestamptz NOT NULL DEFAULT now(),
            "status" text NOT NULL,
            FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE
          );
        `)
      }
    }

    // Ensure demo user exists for e2e tests (modern schema uses Workspace/Company workflow)
    const bcrypt = require('bcryptjs')
    const hashed = await bcrypt.hash('password', 10)
    await prisma.user.upsert({
      where: { email: 'demo@haypbooks.test' },
      update: { name: 'Demo User', password: hashed, isEmailVerified: true },
      create: { email: 'demo@haypbooks.test', name: 'Demo User', password: hashed, isEmailVerified: true }
    })

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
    // Mirror legacy tenant as a workspace for company FK compatibility
    await prisma.workspace.upsert({
      where: { id: tenantId },
      update: { ownerUserId: demoUser!.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' },
      create: { id: tenantId, ownerUserId: demoUser!.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' }
    })

    let tenantRole = await prisma.role.findFirst({ where: { workspaceId: tenantId } })
    if (!tenantRole) {
      tenantRole = await prisma.role.create({ data: { workspaceId: tenantId, name: 'Owner' } })
    }
    await prisma.workspaceUser.create({ data: { workspaceId: tenantId, userId: demoUser!.id, roleId: tenantRole.id, isOwner: true, status: 'ACTIVE' } })

    // Ensure a Company row exists for this tenant so the companies API returns it
    await prisma.company.create({ data: { workspaceId: tenantId, name: 'Owned Company', isActive: true } })

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
    // Mirror legacy tenant to workspace for company FK compatibility
    const tenantOwnerEmail = `tenant-owner-${require('crypto').randomUUID()}@haypbooks.test`
    const tenantOwner = await prisma.user.create({ data: { email: tenantOwnerEmail, name: 'Tenant Owner', password: 'password', isEmailVerified: true } })
    await prisma.workspace.upsert({
      where: { id: tenantId },
      update: { ownerUserId: tenantOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' },
      create: { id: tenantId, ownerUserId: tenantOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' }
    })

    // Create a workspace invite for the demo user so invited filter matches
    const workspaceInviteId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."WorkspaceInvite" ("id","workspaceId","email","invitedBy","status") VALUES (${workspaceInviteId}::uuid, ${tenantId}::uuid, ${'demo@haypbooks.test'}, ${inviterId || tenantOwner.id}, ${'PENDING'}) ON CONFLICT ("workspaceId","email") DO UPDATE SET "status" = EXCLUDED."status", "invitedBy" = EXCLUDED."invitedBy"`

    // Ensure a Company exists for the invited tenant so the API can return it
    await prisma.company.create({ data: { workspaceId: tenantId, name: 'Invited Company', isActive: true } })

    const res = await request(app.getHttpServer()).get('/api/companies?filter=invited').set('Authorization', `Bearer ${token}`).expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    const tenantIds = res.body.map((r: any) => r.workspaceId)
    expect(tenantIds).toContain(tenantId)
  }, 30000)

  it('GET /api/companies/:id is scoped to workspace membership', async () => {
    // Create a workspace and company not linked to demo user
    const workspaceB = require('crypto').randomUUID()
    const workspaceOwnerEmail = `workspace-owner-${require('crypto').randomUUID()}@haypbooks.test`
    const workspaceOwner = await prisma.user.create({ data: { email: workspaceOwnerEmail, name: 'Workspace Owner', password: 'password', isEmailVerified: true } })
    await prisma.workspace.upsert({
      where: { id: workspaceB },
      update: { ownerUserId: workspaceOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' },
      create: { id: workspaceB, ownerUserId: workspaceOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' }
    })
    const companyB = await prisma.company.create({ data: { workspaceId: workspaceB, name: 'Other Company', isActive: true } })

    // Demo user should NOT be able to GET this company
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    await request(app.getHttpServer()).get(`/api/companies/${companyB.id}`).set('Authorization', `Bearer ${token}`).expect(404)

    // Now add demo user as a WorkspaceUser and try again → expect 200
    const demoUserForWorkspace = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    let role = await prisma.role.findFirst({ where: { workspaceId: workspaceB } })
    if (!role) {
      role = await prisma.role.create({ data: { workspaceId: workspaceB, name: 'Member' } })
    }
    await prisma.workspaceUser.create({ data: { workspaceId: workspaceB, userId: demoUserForWorkspace!.id, roleId: role.id, isOwner: false, status: 'ACTIVE' } })

    const res2 = await request(app.getHttpServer()).get(`/api/companies/${companyB.id}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(res2.body).toBeTruthy()
  }, 30000)

  it('GET /api/companies?filter=owned excludes companies for INACTIVE workspace memberships', async () => {
    const workspaceId = require('crypto').randomUUID()
    const foreignOwnerEmail = `inactive-${require('crypto').randomUUID()}@haypbooks.test`
    const foreignOwner = await prisma.user.create({ data: { email: foreignOwnerEmail, name: 'Inactive Owner', password: 'password', isEmailVerified: true } })
    await prisma.workspace.upsert({
      where: { id: workspaceId },
      update: { ownerUserId: foreignOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' },
      create: { id: workspaceId, ownerUserId: foreignOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' }
    })
    let role = await prisma.role.findFirst({ where: { workspaceId } })
    if (!role) role = await prisma.role.create({ data: { workspaceId, name: 'Member' } })
    const demoUser = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    await prisma.workspaceUser.create({ data: { workspaceId, userId: demoUser!.id, roleId: role.id, isOwner: false, status: 'INACTIVE' } })
    await prisma.company.create({ data: { workspaceId, name: 'Inactive Membership Company', isActive: true } })

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const workspaceIds = res.body.map((r: any) => r.workspaceId)
    expect(workspaceIds).not.toContain(workspaceId)
  }, 30000)

  it('GET /api/companies?filter=owned excludes companies for other workspaces', async () => {
    // Create a workspace and company not linked to demo user
    const foreignWorkspace = require('crypto').randomUUID()
    const foreignOwnerEmail = `foreign-${require('crypto').randomUUID()}@haypbooks.test`
    const foreignOwner = await prisma.user.create({ data: { email: foreignOwnerEmail, name: 'Foreign Owner', password: 'password', isEmailVerified: true } })
    await prisma.workspace.upsert({
      where: { id: foreignWorkspace },
      update: { ownerUserId: foreignOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' },
      create: { id: foreignWorkspace, ownerUserId: foreignOwner.id, baseCurrency: 'USD', status: 'ACTIVE', type: 'OWNER' }
    })
    const foreignCompany = await prisma.company.create({ data: { workspaceId: foreignWorkspace, name: 'Foreign Company', isActive: true } })

    // Login as demo user and fetch owned companies
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token

    const res = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const ids = (res.body || []).map((r: any) => r.id)
    expect(ids).not.toContain(foreignCompany.id)
  }, 30000)
})
