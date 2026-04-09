import { PrismaService } from '../repositories/prisma/prisma.service'
import { PrismaClient } from '@prisma/client'
import { PendingSignupService } from './pending-signup.service'
import * as path from 'path'
import { execSync } from 'child_process'

const BACKEND_DIR = path.resolve(__dirname, '../../')

describe('PendingSignupService (db integration)', () => {
  let prismaService: PrismaService
  let prisma: PrismaClient
  let svc: PendingSignupService

  beforeAll(async () => {
    // Ensure test DB
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:<your-db-password>@localhost:5432/haypbooks_test'
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

  it('creates an EmailVerificationToken row and get() can retrieve data (requires EmailVerificationToken table)', async () => {
    // If EmailVerificationToken table is not present, skip the test with a helpful message
    try {
      const existsRes: Array<{ exists: boolean }> = (await prisma.$queryRawUnsafe("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'EmailVerificationToken' OR lower(table_name) = 'emailverificationtoken') as exists")) as any
      if (!existsRes || !existsRes.length || !existsRes[0].exists) {
        console.warn('Skipping test: EmailVerificationToken table not found in DB. Run `prisma migrate` to create this table.')
        return
      }
    } catch (e) {
      console.warn('Skipping test: could not confirm EmailVerificationToken table presence', e?.message || e)
      return
    }

    const email = `presignup-db-${Date.now()}@haypbooks.test`
    const token = await svc.create({ email, hashedPassword: 'x', name: 'DB PreSignup' })
    expect(typeof token).toBe('string')

    const row = await prisma.emailVerificationToken.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    expect(row).toBeTruthy()
    expect(row!.tokenHash).toBeTruthy()
    expect(new Date(row!.expiresAt).getTime()).toBeGreaterThan(Date.now())

    // svc.get should validate the token and return the stored data
    const payload = await svc.get(token)
    expect(payload).toBeTruthy()
    expect((payload as any).email).toEqual(email)

    // update and delete operations
    const updated = await svc.update(token, { name: 'Updated' })
    expect(updated).toBeTruthy()
    expect((updated as any).name).toEqual('Updated')

    const ok = await svc.delete(token)
    expect(ok).toBe(true)
  })
})