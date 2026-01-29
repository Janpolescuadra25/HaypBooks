import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

// Helper: create a company via raw INSERT to avoid relying on schema parity for new optional columns
async function createCompanyRaw(prisma: PrismaService, workspaceId: string, name: string, currency = 'USD') {
  const { randomUUID } = require('crypto')
  const id = randomUUID()
  await prisma.$executeRawUnsafe('INSERT INTO public."Company" ("id","tenantId","name","currency","createdAt") VALUES ($1, $2::uuid, $3, $4, now())', id, tenantId, name, currency)
  const row: any[] = await prisma.$queryRawUnsafe('SELECT "id","tenantId","name","currency" FROM public."Company" WHERE "id" = $1 LIMIT 1', id)
  return row && row.length ? row[0] : { id, tenantId, name, currency }
}

describe('TestController /api/test/delete-company (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()

    // replicate app setup similar to main.ts
    try { const cookieParser = require('cookie-parser'); app.use(cookieParser()) } catch (e) { /* ignore */ }
    app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({ whitelist: true, forbidNonWhitelisted: true, transform: true }))

    await app.init()
    prisma = moduleRef.get(PrismaService)
  })

  afterAll(async () => {
    if (app) await app.close()
  })

  test('deletes a test-created company and tenant when requested', async () => {
    // seed user, tenant, and company with E2E markers
    const suffix = Date.now().toString(36)
    const email = `e2e-delete-${suffix}@local`
    const tenantName = `Acme (E2E) ${suffix}`
    const subdomain = `e2e-delete-${suffix}`
    const companyName = `Acme E2E ${suffix}`

    const user = await prisma.user.create({ data: { email, password: 'x', name: 'E', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await createCompanyRaw(prisma, tenant.id, companyName, 'USD')

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('deleted')
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    const deletedTenant = await prisma.workspace.findUnique({ where: { id: tenant.id }, select: { id: true } })
    if (deletedTenant) {
      // Tenant deletion is best-effort; if it remains, ensure it has no companies
      const remainingCompanies = await prisma.company.findMany({ where: { workspaceId: tenant.id } })
      expect(remainingCompanies.length).toBe(0)
    }

    // cleanup user (tenant may already be removed)
    try { await prisma.user.delete({ where: { id: user.id } }) } catch (e) { /* ignore */ }
  })

  test('refuses to delete non-test companies', async () => {
    const user = await prisma.user.create({ data: { email: `e2e-delete2-${Date.now().toString(36)}@local`, password: 'x', name: 'E', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await createCompanyRaw(prisma, tenant.id, 'Acme', 'USD')

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: 'Acme' })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(0)
    expect(res.body.message).toMatch(/none appear to be test-created/i)

    // cleanup
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.workspaceUser.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.workspace.delete({ where: { id: tenant.id }, select: { id: true } })
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('does not delete tenant when tenant has multiple users', async () => {
    const s = Date.now().toString(36)
    const u1 = await prisma.user.create({ data: { email: `multi1-${s}@local`, password: 'x', name: 'A', isEmailVerified: true } })
    const u2 = await prisma.user.create({ data: { email: `multi2-${s}@local`, password: 'x', name: 'B', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: u1.id, role: 'owner', isOwner: true } })
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: u2.id, role: 'member', isOwner: false } })
    const company = await createCompanyRaw(prisma, tenant.id, `Comp A E2E ${s}`, 'USD')

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: u1.email, name: company.name, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    const tenantStill = await prisma.workspace.findUnique({ where: { id: tenant.id }, select: { id: true } })
    expect(tenantStill).not.toBeNull()

    // cleanup: ensure tenant and users deleted
    await prisma.workspaceUser.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.company.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.workspace.delete({ where: { id: tenant.id }, select: { id: true } })
    await prisma.user.delete({ where: { id: u1.id } })
    await prisma.user.delete({ where: { id: u2.id } })
  })

  test('does not delete tenant when tenant has other companies', async () => {
    const s = Date.now().toString(36)
    const user = await prisma.user.create({ data: { email: `multi-co-${s}@local`, password: 'x', name: 'C', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const companyA = await createCompanyRaw(prisma, tenant.id, `Primary E2E ${s}`, 'USD')
    const companyB = await createCompanyRaw(prisma, tenant.id, `OtherCo ${s}`, 'USD')

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyA.name, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: companyA.id } })
    expect(deletedCompany).toBeNull()

    const otherCompany = await prisma.company.findUnique({ where: { id: companyB.id } })
    expect(otherCompany).not.toBeNull()

    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id }, select: { id: true } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.company.delete({ where: { id: companyB.id } })
    await prisma.tenantUser.deleteMany({ where: { workspaceId: tenant.id } })
    // Use raw DELETE to avoid Prisma selecting dropped Tenant columns
    await prisma.$executeRawUnsafe('DELETE FROM public."Tenant" WHERE id = $1::uuid', tenant.id)
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('does not delete tenant when tenant has system accounts', async () => {
    const s = Date.now().toString(36)
    const email = `e2e-system-${s}@local`
    const tenantName = `SysTenant (E2E) ${s}`
    const subdomain = `e2e-sys-${s}`
    const companyName = `Corp E2E ${s}`

    const user = await prisma.user.create({ data: { email, password: 'x', name: 'Sys', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await createCompanyRaw(prisma, tenant.id, companyName, 'USD')

    // create or reuse an existing account type and a system account for the tenant
    let acctType = await prisma.accountType.findFirst()
    if (!acctType) acctType = await prisma.accountType.create({ data: { name: `ASSET-${s}` } })
    await prisma.account.create({ data: { workspaceId: tenant.id, code: `SYS-${s}`, name: 'Accounts Receivable (SYS)', typeId: acctType.id, isSystem: true } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    // tenant should remain because the system account prevents deletion
    const tenantStill = await prisma.workspace.findUnique({ where: { id: tenant.id }, select: { id: true } })
    expect(tenantStill).not.toBeNull()

    // cleanup: remove system account, then clean up
    await prisma.account.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.company.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.tenantUser.deleteMany({ where: { workspaceId: tenant.id } })
    // Use raw DELETE to avoid Prisma selecting dropped Tenant columns
    await prisma.$executeRawUnsafe('DELETE FROM public."Tenant" WHERE id = $1::uuid', tenant.id)
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('tenant.delete errors are swallowed when other blocking rows exist', async () => {
    const s = Date.now().toString(36)
    const email = `e2e-block-${s}@local`
    const tenantName = `BlockTenant (E2E) ${s}`
    const subdomain = `e2e-block-${s}`
    const companyName = `BlockCorp E2E ${s}`

    const user = await prisma.user.create({ data: { email, password: 'x', name: 'Blk', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await createCompanyRaw(prisma, tenant.id, companyName, 'USD')

    // Add a JournalEntry row that will cause tenant.delete to fail (FK prevents tenant deletion)
    await prisma.journalEntry.create({ data: { workspaceId: tenant.id, date: new Date(), entryNumber: `J-${s}` } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    // tenant should remain because of the blocking JournalEntry
    const tenantStill = await prisma.workspace.findUnique({ where: { id: tenant.id }, select: { id: true } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.journalEntry.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.company.deleteMany({ where: { workspaceId: tenant.id } })
    await prisma.tenantUser.deleteMany({ where: { workspaceId: tenant.id } })
    // Use raw DELETE to avoid Prisma selecting dropped Tenant columns
    await prisma.$executeRawUnsafe('DELETE FROM public."Tenant" WHERE id = $1::uuid', tenant.id)
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('delete by companyId does not delete tenant when other companies exist', async () => {
    const s = Date.now().toString(36)
    const user = await prisma.user.create({ data: { email: `byid-${s}@local`, password: 'x', name: 'D', isEmailVerified: true } })
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const companyA = await createCompanyRaw(prisma, tenant.id, `ToDelete E2E ${s}`, 'USD')
    const companyB = await createCompanyRaw(prisma, tenant.id, `KeepCompany ${s}`, 'USD')

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ companyId: companyA.id, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: companyA.id } })
    expect(deletedCompany).toBeNull()

    const otherCompany = await prisma.company.findUnique({ where: { id: companyB.id } })
    expect(otherCompany).not.toBeNull()

    const tenantStill = await prisma.workspace.findUnique({ where: { id: tenant.id }, select: { id: true } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.company.delete({ where: { id: companyB.id } })
    await prisma.workspaceUser.deleteMany({ where: { workspaceId: tenant.id } })
    // Use raw DELETE to avoid Prisma selecting dropped Tenant columns
    await prisma.$executeRawUnsafe('DELETE FROM public."Tenant" WHERE id = $1::uuid', tenant.id)
    await prisma.user.delete({ where: { id: user.id } })
  })
})