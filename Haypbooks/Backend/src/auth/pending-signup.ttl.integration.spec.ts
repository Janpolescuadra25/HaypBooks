import { PrismaService } from '../repositories/prisma/prisma.service'
import { PrismaClient } from '@prisma/client'
import { PendingSignupService } from './pending-signup.service'
import * as path from 'path'
import { execSync } from 'child_process'

const BACKEND_DIR = path.resolve(__dirname, '../../')

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('PendingSignupService TTL expiry (db integration)', () => {
  let prismaService: PrismaService
  let prisma: PrismaClient
  let svc: PendingSignupService

  beforeAll(async () => {
    // Ensure test DB
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

    prisma = new PrismaClient()
    await prisma.$connect()
    prismaService = new PrismaService()
    await prismaService.$connect()
    svc = new PendingSignupService(prismaService as any)
  }, 60000)

  afterAll(async () => {
    await prisma.$disconnect()
    await prismaService.$disconnect()
  })

  beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany({}).catch(() => {})
    await prisma.otp.deleteMany({}).catch(() => {})
    await prisma.user.deleteMany({ where: { email: { contains: 'presignup-db' } } }).catch(() => {})
  })

  test('token expires after short TTL and get() returns null', async () => {
    // Skip if table missing
    try {
      const existsRes: Array<{ exists: boolean }> = (await prisma.$queryRawUnsafe("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'EmailVerificationToken' OR lower(table_name) = 'emailverificationtoken') as exists")) as any
      if (!existsRes || !existsRes.length || !existsRes[0].exists) {
        console.warn('Skipping TTL test: EmailVerificationToken table not found in DB. Run `prisma migrate` to create this table.')
        return
      }
    } catch (e) {
      console.warn('Skipping TTL test: could not confirm EmailVerificationToken table presence', e?.message || e)
      return
    }

    const email = `presignup-ttl-${Date.now()}@haypbooks.test`
    // Create with TTL of 2 seconds (use slightly larger TTL to avoid clock-skew flakiness)
    const token = await svc.create({ email, hashedPassword: 'x', name: 'DB PreSignup TTL' }, 2)
    expect(typeof token).toBe('string')

    let payload = await svc.get(token)
    if (!payload) {
      // Retry once in case of tiny timing variance
      await sleep(50)
      payload = await svc.get(token)
    }
    expect(payload).toBeTruthy()

    // Wait for 3000ms to ensure expiry given TTL was set to 2s
    await sleep(3000)

    const after = await svc.get(token)
    expect(after).toBeNull()

    // Row may still exist but should be expired
    const row = await prisma.emailVerificationToken.findUnique({ where: { id: String(token).split('.')[0] } })
    if (row) {
      expect(new Date(row.expiresAt).getTime()).toBeLessThanOrEqual(Date.now())
    }
  }, 20000)
})
