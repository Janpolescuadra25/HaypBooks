import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

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
    const tenant = await prisma.tenant.create({ data: { name: tenantName, subdomain } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await prisma.company.create({ data: { tenantId: tenant.id, name: companyName, currency: 'USD' } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('deleted')
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    const deletedTenant = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    if (deletedTenant) {
      // Tenant deletion is best-effort; if it remains, ensure it has no companies
      const remainingCompanies = await prisma.company.findMany({ where: { tenantId: tenant.id } })
      expect(remainingCompanies.length).toBe(0)
    }

    // cleanup user (tenant may already be removed)
    try { await prisma.user.delete({ where: { id: user.id } }) } catch (e) { /* ignore */ }
  })

  test('refuses to delete non-test companies', async () => {
    const user = await prisma.user.create({ data: { email: `e2e-delete2-${Date.now().toString(36)}@local`, password: 'x', name: 'E', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: 'Acme Inc', subdomain: `acct-xyz-${Date.now().toString(36)}` } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await prisma.company.create({ data: { tenantId: tenant.id, name: 'Acme', currency: 'USD' } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: 'Acme' })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(0)
    expect(res.body.message).toMatch(/none appear to be test-created/i)

    // cleanup
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('does not delete tenant when tenant has multiple users', async () => {
    const s = Date.now().toString(36)
    const u1 = await prisma.user.create({ data: { email: `multi1-${s}@local`, password: 'x', name: 'A', isEmailVerified: true } })
    const u2 = await prisma.user.create({ data: { email: `multi2-${s}@local`, password: 'x', name: 'B', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: `MultiTenant (E2E) ${s}`, subdomain: `e2e-multi-${s}` } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: u1.id, role: 'owner', isOwner: true } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: u2.id, role: 'member', isOwner: false } })
    const company = await prisma.company.create({ data: { tenantId: tenant.id, name: `Comp A E2E ${s}`, currency: 'USD' } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: u1.email, name: company.name, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    expect(tenantStill).not.toBeNull()

    // cleanup: ensure tenant and users deleted
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.company.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: u1.id } })
    await prisma.user.delete({ where: { id: u2.id } })
  })

  test('does not delete tenant when tenant has other companies', async () => {
    const s = Date.now().toString(36)
    const user = await prisma.user.create({ data: { email: `multi-co-${s}@local`, password: 'x', name: 'C', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: `OtherCo Tenant (E2E) ${s}`, subdomain: `e2e-other-${s}` } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const companyA = await prisma.company.create({ data: { tenantId: tenant.id, name: `Primary E2E ${s}`, currency: 'USD' } })
    const companyB = await prisma.company.create({ data: { tenantId: tenant.id, name: `OtherCo ${s}`, currency: 'USD' } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyA.name, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: companyA.id } })
    expect(deletedCompany).toBeNull()

    const otherCompany = await prisma.company.findUnique({ where: { id: companyB.id } })
    expect(otherCompany).not.toBeNull()

    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.company.delete({ where: { id: companyB.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('does not delete tenant when tenant has system accounts', async () => {
    const s = Date.now().toString(36)
    const email = `e2e-system-${s}@local`
    const tenantName = `SysTenant (E2E) ${s}`
    const subdomain = `e2e-sys-${s}`
    const companyName = `Corp E2E ${s}`

    const user = await prisma.user.create({ data: { email, password: 'x', name: 'Sys', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: tenantName, subdomain } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await prisma.company.create({ data: { tenantId: tenant.id, name: companyName, currency: 'USD' } })

    // create or reuse an existing account type and a system account for the tenant
    let acctType = await prisma.accountType.findFirst()
    if (!acctType) acctType = await prisma.accountType.create({ data: { name: `ASSET-${s}` } })
    await prisma.account.create({ data: { tenantId: tenant.id, code: `SYS-${s}`, name: 'Accounts Receivable (SYS)', typeId: acctType.id, isSystem: true } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    // tenant should remain because the system account prevents deletion
    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    expect(tenantStill).not.toBeNull()

    // cleanup: remove system account, then clean up
    await prisma.account.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.company.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('tenant.delete errors are swallowed when other blocking rows exist', async () => {
    const s = Date.now().toString(36)
    const email = `e2e-block-${s}@local`
    const tenantName = `BlockTenant (E2E) ${s}`
    const subdomain = `e2e-block-${s}`
    const companyName = `BlockCorp E2E ${s}`

    const user = await prisma.user.create({ data: { email, password: 'x', name: 'Blk', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: tenantName, subdomain } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const company = await prisma.company.create({ data: { tenantId: tenant.id, name: companyName, currency: 'USD' } })

    // Add a JournalEntry row that will cause tenant.delete to fail (FK prevents tenant deletion)
    await prisma.journalEntry.create({ data: { tenantId: tenant.id, date: new Date(), entryNumber: `J-${s}` } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ email: user.email, name: companyName, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: company.id } })
    expect(deletedCompany).toBeNull()

    // tenant should remain because of the blocking JournalEntry
    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.journalEntry.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.company.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })

  test('delete by companyId does not delete tenant when other companies exist', async () => {
    const s = Date.now().toString(36)
    const user = await prisma.user.create({ data: { email: `byid-${s}@local`, password: 'x', name: 'D', isEmailVerified: true } })
    const tenant = await prisma.tenant.create({ data: { name: `ById Tenant (E2E) ${s}`, subdomain: `e2e-byid-${s}` } })
    await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, role: 'owner', isOwner: true } })
    const companyA = await prisma.company.create({ data: { tenantId: tenant.id, name: `ToDelete E2E ${s}`, currency: 'USD' } })
    const companyB = await prisma.company.create({ data: { tenantId: tenant.id, name: `KeepCompany ${s}`, currency: 'USD' } })

    const res = await request(app.getHttpServer()).post('/api/test/delete-company').send({ companyId: companyA.id, deleteTenant: true })
    expect(res.status).toBe(201)
    expect(res.body.deleted).toBe(1)

    const deletedCompany = await prisma.company.findUnique({ where: { id: companyA.id } })
    expect(deletedCompany).toBeNull()

    const otherCompany = await prisma.company.findUnique({ where: { id: companyB.id } })
    expect(otherCompany).not.toBeNull()

    const tenantStill = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    expect(tenantStill).not.toBeNull()

    // cleanup
    await prisma.company.delete({ where: { id: companyB.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })
})