import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

describe('Backfill phoneHmac script (integration)', () => {
  const prisma = new PrismaClient()
  beforeAll(async () => {
    // Ensure test DB is migrated/seeded when running this integration test standalone
    try {
      console.log('Ensuring migrations and seed are applied for test DB')
      execSync('npm run migrate:init', { stdio: 'inherit' })
      execSync('node ./scripts/migrate/run-sql.js', { stdio: 'inherit' })
      execSync('npm run db:seed:dev', { stdio: 'inherit' })
    } catch (e) {
      // If migration/seed fails, best-effort continue and let the test run and fail with actionable error
      console.warn('Migration/seed step failed (continuing):', e?.message || e)
    }
  })

  afterAll(async () => { await prisma.$disconnect() })

  test('populates phoneHmac for users with phone and phoneHmac null', async () => {
    // Create a user with phone and null phoneHmac
    const unique = Date.now()
    const u = await prisma.user.create({ data: { email: `backfill-${unique}@example.test`, password: 'x', phone: `+1555${String(unique).slice(-7)}` } })

    // Ensure HMAC_KEY is set for the child process; use cross-env to inject it cross-platform
    const key = process.env.HMAC_KEY || 'testkey'

    // Run the backfill script using npm script so it uses project ts-node
    execSync(`npx cross-env HMAC_KEY=${key} npm run db:backfill:phoneHmac`, { stdio: 'inherit' })

    const updated = await prisma.user.findUnique({ where: { id: u.id } })
    expect(updated).not.toBeNull()
    const got: any = updated
    expect(got.phoneHmac).toBeDefined()
    expect(got.phoneHmac).not.toBeNull()

    // Clean up
    await prisma.user.delete({ where: { id: u.id } })
  }, 30000)
})