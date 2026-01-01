import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

describe('Backfill phoneHmac script (integration)', () => {
  const prisma = new PrismaClient()
  beforeAll(async () => {
    // Ensure test DB is migrated/seeded by the usual test setup; test runner should do this.
  })

  afterAll(async () => { await prisma.$disconnect() })

  test('populates phoneHmac for users with phone and phoneHmac null', async () => {
    // Create a user with phone and null phoneHmac
    const u = await prisma.user.create({ data: { email: `backfill-${Date.now()}@example.test`, password: 'x', phone: '+15550007777' } })

    // Ensure HMAC_KEY is set for the child process
    process.env.HMAC_KEY = process.env.HMAC_KEY || 'testkey'

    // Run the backfill script using npm script so it uses project ts-node
    execSync('npm run db:backfill:phoneHmac', { stdio: 'inherit' })

    const updated = await prisma.user.findUnique({ where: { id: u.id } })
    expect(updated).not.toBeNull()
    expect(updated!.phoneHmac).toBeDefined()
    expect(updated!.phoneHmac).not.toBeNull()

    // Clean up
    await prisma.user.delete({ where: { id: u.id } })
  }, 20000)
})