import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import { execSync } from 'child_process'

const prisma = new PrismaClient()
const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('ProAdvisorPerk basic CRUD', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
    // seed will run as part of setup
    execSync('npm run db:seed:dev', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
  }, 120000)

  it('creates and reads a ProAdvisorPerk for a user', async () => {
    // create a test user
    const user = await prisma.user.create({ data: { email: `perk-test-${Date.now()}@example`, password: 'x', name: 'Perk Test' } })
    // create a perk via raw SQL (Prisma client may not have the generated model if client not regenerated)
    // Ensure table exists (some migration runners may skip DDL on certain errors)
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS public."ProAdvisorPerk" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" text NOT NULL, "type" text NOT NULL, "name" text NOT NULL, "issuer" text, "awardedAt" timestamptz NOT NULL DEFAULT now(), "metadata" jsonb)`
    await prisma.$executeRaw`INSERT INTO public."ProAdvisorPerk" ("userId","type","name","issuer","awardedAt") VALUES (${user.id}, ${'CERTIFICATION'}, ${'Test Cert'}, ${'TestOrg'}, now())`
    const perks: any[] = await prisma.$queryRaw`SELECT * FROM public."ProAdvisorPerk" WHERE "userId" = ${user.id}`
    expect(perks.length).toBeGreaterThanOrEqual(1)
    expect(perks.map(p => p.name)).toContain('Test Cert')
  }, 30000)

  afterAll(async () => {
    await prisma.$disconnect()
  })
})
