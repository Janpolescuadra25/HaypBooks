import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

describe('DB regression: Company.name non-null', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    // ensure fresh test DB so regression is checked against seeded state + any backfills
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env } })
    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('no Company rows with name == NULL', async () => {
    const count = await prisma.company.count({ where: { name: null as any } })
    expect(count).toBe(0)
  }, 15000)
})
