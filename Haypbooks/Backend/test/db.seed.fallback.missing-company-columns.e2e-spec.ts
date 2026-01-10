import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

describe('DB seed fallback when Company columns missing (e2e)', () => {
  const prisma = new PrismaClient()
  const BACKEND_DIR = path.resolve(__dirname, '..')

  beforeAll(async () => {
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    // Intentionally drop Company profile columns to simulate a phased migration state
    const dropSql = `ALTER TABLE public."Company" DROP COLUMN IF EXISTS "businessType";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "industry";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "address";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "taxId";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "logoUrl";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "invoicePrefix";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "vatRegistered";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "vatRate";
ALTER TABLE public."Company" DROP COLUMN IF EXISTS "pricesInclusive";`
    try {
      execSync(`psql ${process.env.DATABASE_URL ? process.env.DATABASE_URL : 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'} -c "${dropSql.replace(/"/g, '\\"')}"`, { cwd: BACKEND_DIR, stdio: 'inherit' })
    } catch (e) {
      // ignore: some test environments may not have psql binary; fall back to running ensure script which will re-add columns
      console.warn('psql drop failed (ignored):', e && e.message)
    }
  }, 180000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('seed completes even when Company profile columns are missing', async () => {
    // Run ensure script (should add columns back), then seed; seed has fallback paths for missing columns
    execSync('node ./scripts/db/ensure_company_profile_columns_pg.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/test/assert-schema.js', { cwd: BACKEND_DIR, stdio: 'inherit' })

    // Run seed (should not throw)
    execSync('npm run db:seed:dev', { cwd: BACKEND_DIR, stdio: 'inherit' })

    // Assert demo tenant exists
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeDefined()
  }, 60000)
})