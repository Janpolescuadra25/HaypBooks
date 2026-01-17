import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

describe('DB regression: Company.name non-null', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env } })
    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('no Company rows with name == NULL', async () => {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT id FROM public."Company" WHERE name IS NULL LIMIT 2')
    expect(rows.length).toBe(0)
  }, 15000)
})
