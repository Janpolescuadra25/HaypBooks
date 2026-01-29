import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

describe('DB backfill Tenant->Company (e2e)', () => {
  const prisma = new PrismaClient()
  const BACKEND_DIR = path.resolve(__dirname, '..')

  beforeAll(async () => {
    // Recreate DB + run migrations
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit' })

    // Ensure company and tenant onboarding columns exist for test
    execSync('node ./scripts/db/ensure_company_profile_columns_pg.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/db/add-onboarding-tenant-columns.js', { cwd: BACKEND_DIR, stdio: 'inherit' })

    // Sanity check schema
    execSync('node ./scripts/test/assert-schema.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
  }, 120000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('copies tenant onboarding/business fields into Company records', async () => {
    // Create a tenant with onboarding/business fields set
    const tenantId = '00000000-0000-4000-8000-000000000100'
    await prisma.$executeRawUnsafe(`INSERT INTO public."Tenant" ("id","businessType","industry","address","taxId","logoUrl","invoicePrefix","vatRegistered","vatRate","pricesInclusive","createdAt","updatedAt") VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now()) ON CONFLICT ("id") DO UPDATE SET "businessType" = EXCLUDED."businessType"`, tenantId, 'Retail', 'Grocery', '123 Market St', 'TIN-123', 'https://cdn.example/logo.png', 'BF-', true, 12, true)
    const tenant = { id: tenantId }

    // Ensure there's a company to receive the backfill
    // Create with nullable fields explicitly set to null so backfill can populate them
    const company = await prisma.company.create({ data: { workspaceId: tenant.id, name: 'Backfill Company', currency: 'USD', businessType: null, industry: null, address: null, taxId: null, logoUrl: null, invoicePrefix: null, vatRegistered: null, vatRate: null, pricesInclusive: null } })

    // Run backfill script
    execSync('node ./scripts/db/backfill-tenant-to-company.js', { cwd: BACKEND_DIR, stdio: 'inherit' })

    // Refresh company and assert fields copied
    const updated = await prisma.company.findUnique({ where: { id: company.id } })
    expect(updated).toBeDefined()
    expect(updated?.businessType).toBe('Retail')
    expect(updated?.industry).toBe('Grocery')
    expect(updated?.address).toBe('123 Market St')
    expect(updated?.taxId).toBe('TIN-123')
    expect(updated?.logoUrl).toBe('https://cdn.example/logo.png')
    expect(updated?.invoicePrefix).toBe('BF-')
    expect(updated?.vatRegistered).toBeTruthy()
    expect(Number(updated?.vatRate)).toBe(12)
    expect(updated?.pricesInclusive).toBeTruthy()

  }, 20000)
})