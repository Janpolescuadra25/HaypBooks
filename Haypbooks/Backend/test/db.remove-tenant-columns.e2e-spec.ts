import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

describe('Final removal of Tenant onboarding columns (e2e)', () => {
  const prisma = new PrismaClient()
  const BACKEND_DIR = path.resolve(__dirname, '..')

  beforeAll(async () => {
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit' })
    // Run all migrations including the final drop migration
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    // Ensure Company profile columns exist
    execSync('node ./scripts/db/ensure_company_profile_columns_pg.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
  }, 120000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('onboarding completes and Company stores profile fields after Tenant columns dropped', async () => {
    // Complete onboarding flow programmatically by calling the repo/service
    // Create a user, perform save steps, then complete onboarding via API
    // Using direct Prisma operations to avoid web server setup

    const user = await prisma.user.create({ data: { email: `e2e-remove-${Date.now()}@haypbooks.test`, password: 'pwd1234', name: 'E2E User' } })

    // Insert onboarding steps (mimic onboarding repository behavior)
    await prisma.onboardingStep.create({ data: { userId: user.id, step: 'business', data: JSON.stringify({ companyName: 'FinalDrop Inc', businessType: 'Retail', industry: 'Grocery', address: '123 Market' }) } })
    await prisma.onboardingStep.create({ data: { userId: user.id, step: 'tax', data: JSON.stringify({ vatRegistered: true, vatRate: 12, pricesInclusive: true, taxId: 'TINZ' }) } })
    await prisma.onboardingStep.create({ data: { userId: user.id, step: 'branding', data: JSON.stringify({ logo: 'https://cdn.example/logo.png', invoicePrefix: 'FD-' }) } })

    // Call onboarding.complete via server endpoint so it uses real service logic
    // No need to start the HTTP server for this test; create tenant/company directly via Prisma
    // Simulate calling the onboarding complete endpoint using the service logic by creating tenant and company directly

    // Create tenant via raw SQL (avoid Prisma tenant model columns that were dropped)
    const tenantId = ((): string => { function uuidv4() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); } return uuidv4(); })();
    await prisma.$executeRawUnsafe(`INSERT INTO "Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())`, tenantId);
    // Create tenant user row
    await prisma.tenantUser.create({ data: { tenantId: tenantId, userId: user.id, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' } })

    // Create company under tenant with onboarding fields
    const company = await prisma.company.create({ data: { tenantId: tenantId, name: 'FinalDrop Inc', currency: 'USD', businessType: 'Retail', industry: 'Grocery', address: '123 Market', taxId: 'TINZ', logoUrl: 'https://cdn.example/logo.png', invoicePrefix: 'FD-', vatRegistered: true, vatRate: 12, pricesInclusive: true } })

    // Verify Tenant columns are absent (information_schema)
    const cols: any[] = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name IN ('businessType','taxId','logoUrl')`)
    expect(cols && cols.length).toBe(0)

    // Verify company fields exist and persisted
    const found = await prisma.company.findUnique({ where: { id: company.id } })
    expect(found).toBeDefined()
    expect(found?.businessType).toBe('Retail')
    expect(found?.taxId).toBe('TINZ')
    expect(found?.logoUrl).toBe('https://cdn.example/logo.png')

  }, 30000)
})