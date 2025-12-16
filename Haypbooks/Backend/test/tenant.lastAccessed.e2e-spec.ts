import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('TenantUser lastAccessed e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('seed sets lastAccessedAt and it can be updated', async () => {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()

    // Find seeded tenant user
    const tu = await prisma.tenantUser.findFirst({ where: { tenantId: tenant!.id } })
    expect(tu).toBeTruthy()

    // The seed should set lastAccessedAt on the demo tenant user
    expect((tu as any).lastAccessedAt).toBeTruthy()

    // Update lastAccessedAt and verify
    const before = (tu as any).lastAccessedAt
    const updated = await prisma.tenantUser.update({ where: { tenantId_userId: { tenantId: tenant!.id, userId: (tu as any).userId } }, data: { lastAccessedAt: new Date() } })
    expect(updated.lastAccessedAt).toBeTruthy()
    const beforeTs = before ? new Date(before).getTime() : 0
    expect(new Date(updated.lastAccessedAt!).getTime()).toBeGreaterThan(beforeTs)
  }, 20000)
})
