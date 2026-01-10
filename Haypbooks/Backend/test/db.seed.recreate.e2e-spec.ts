import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

describe('DB recreate + seed integration (e2e)', () => {
  const prisma = new PrismaClient()
  const BACKEND_DIR = path.resolve(__dirname, '..')

  beforeAll(async () => {
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/db/ensure_company_profile_columns_pg.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/test/assert-schema.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('npm run db:seed:dev', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/test/db-assertions.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
  }, 180000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates the demo tenant and default roles', async () => {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeDefined()
    const roles = await prisma.role.findMany({ where: { tenantId: tenant!.id }, orderBy: { name: 'asc' } })
    const roleNames = roles.map(r => r.name)
    expect(roleNames).toEqual(expect.arrayContaining(['Owner','Admin','Bookkeeper','Viewer']))
  }, 20000)
})