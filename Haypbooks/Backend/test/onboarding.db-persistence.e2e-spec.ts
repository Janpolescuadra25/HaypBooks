/**
 * onboarding.db-persistence.e2e-spec.ts
 *
 * Verifies that every onboarding step is actually written to the database and
 * that calling /api/onboarding/complete creates the expected Workspace +
 * Company (OWNER hub) or Workspace + Practice (ACCOUNTANT hub).
 *
 * Tests deliberately mirror the real frontend flow:
 *   1. Sign up → verify OTP → receive JWT
 *   2. POST /api/onboarding/save  (once per step)
 *   3. GET  /api/onboarding/save  (verify steps are readable)
 *   4. POST /api/onboarding/complete
 *   5. Direct Prisma assertions on DB rows
 */

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Onboarding → DB persistence (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  // ── Boot ──────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 90000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Wipe sessions and OTPs between tests so login helpers stay clean
    await prisma.session.deleteMany({})
    await prisma.otp.deleteMany({})
    // Remove any test users created by these tests
    await prisma.user.deleteMany({ where: { email: { contains: 'onb-persist' } } }).catch(() => {})
  })

  // ── Helper ────────────────────────────────────────────────────────────────

  /**
   * Full sign-up → OTP verify → returns JWT.
   * Mirrors what the frontend does after the user fills in the sign-up form.
   */
  async function signupAndGetToken(
    email: string,
    password: string,
    name: string,
  ): Promise<string> {
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password, name, phone: '+1 555 100 9999' })

    // Some signup flows return the token immediately (no OTP required)
    if (signupRes.body?.token) return signupRes.body.token

    const signupToken = signupRes.body?.signupToken
    if (!signupToken) {
      throw new Error('Signup did not return signupToken: ' + JSON.stringify(signupRes.body))
    }

    // Retrieve the OTP that was stored in the DB (no real email required in tests)
    const otpRow = await prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    })
    if (!otpRow) throw new Error(`No OTP row found for ${email}`)

    const completeRes = await request(app.getHttpServer())
      .post('/api/auth/complete-signup')
      .send({ signupToken, code: otpRow.otpCode, method: 'email' })
      .expect(200)

    return completeRes.body.token as string
  }

  // ── OWNER hub ─────────────────────────────────────────────────────────────

  it('OWNER: each saved step is written to OnboardingData and complete creates Workspace + Company', async () => {
    const email = `onb-persist-owner-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist Owner')

    const user = await prisma.user.findUnique({ where: { email } })
    expect(user).toBeTruthy()
    const userId = user!.id

    // ── 1. Save each step ──────────────────────────────────────────────────

    const companyName = `PersistCo ${Date.now()}`

    // business step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'business',
        data: {
          businessName: companyName,
          companyName,
          legalBusinessName: `${companyName} LLC`,
          businessType: 'Software',
          industry: 'Technology',
          country: 'PH',  // ISO-2 code; full name ('Philippines') is also supported via service mapping
          contactName: 'Test Contact',
        },
      })
      .expect([200, 201])

    // Assert business step is in the DB immediately after save
    let onb = await prisma.onboardingData.findUnique({ where: { userId } })
    expect(onb).toBeTruthy()
    expect(onb!.complete).toBe(false)
    const steps1 = onb!.steps as Record<string, any>
    expect(steps1.business).toBeDefined()
    expect(steps1.business.businessName).toBe(companyName)
    expect(steps1.business.businessType).toBe('Software')

    // products step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'products',
        data: { sellProducts: false, trackInventory: false, sellServices: true, runPayroll: false },
      })
      .expect([200, 201])

    onb = await prisma.onboardingData.findUnique({ where: { userId } })
    const steps2 = onb!.steps as Record<string, any>
    expect(steps2.products).toBeDefined()
    expect(steps2.products.sellServices).toBe(true)
    // Previous step should still be there
    expect(steps2.business.businessName).toBe(companyName)

    // fiscal_tax step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'fiscal_tax',
        data: {
          fiscalStart: 'January',
          currency: 'PHP',
          accountingMethod: 'accrual',
          taxRate: 12,
          taxType: 'VAT',
          filingFrequency: 'quarterly',
          collectTax: true,
          inclusive: false,
        },
      })
      .expect([200, 201])

    onb = await prisma.onboardingData.findUnique({ where: { userId } })
    const steps3 = onb!.steps as Record<string, any>
    expect(steps3.fiscal_tax).toBeDefined()
    expect(steps3.fiscal_tax.currency).toBe('PHP')
    expect(steps3.fiscal_tax.taxRate).toBe(12)

    // branding step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'branding',
        data: { invoicePrefix: 'INV-', paymentTerms: 'Net 30' },
      })
      .expect([200, 201])

    // banking step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'banking',
        data: { automatedFeeds: true, accounts: [] },
      })
      .expect([200, 201])

    // ── 2. GET /api/onboarding/save returns all saved steps ────────────────

    const loadRes = await request(app.getHttpServer())
      .get('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const loadedSteps = loadRes.body.steps as Record<string, any>
    expect(loadedSteps.business.businessName).toBe(companyName)
    expect(loadedSteps.products.sellServices).toBe(true)
    expect(loadedSteps.fiscal_tax.currency).toBe('PHP')
    expect(loadedSteps.branding.invoicePrefix).toBe('INV-')
    expect(loadedSteps.banking.automatedFeeds).toBe(true)

    // ── 3. Complete onboarding ─────────────────────────────────────────────

    const completeRes = await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    expect(completeRes.body.success).toBe(true)

    // ── 4. DB assertions after complete ───────────────────────────────────

    // OnboardingData row must be marked complete
    onb = await prisma.onboardingData.findUnique({ where: { userId } })
    expect(onb).toBeTruthy()
    expect(onb!.complete).toBe(true)

    // All step data must still be present (complete() must not wipe steps)
    const finalSteps = onb!.steps as Record<string, any>
    expect(finalSteps.business.businessName).toBe(companyName)
    expect(finalSteps.fiscal_tax.currency).toBe('PHP')

    // A Workspace must have been created for this user
    const workspace = await prisma.workspace.findUnique({ where: { ownerUserId: userId } })
    expect(workspace).toBeTruthy()
    expect(workspace!.type).toBe('OWNER')

    // A Company must live under that Workspace
    const companies = await prisma.company.findMany({ where: { workspaceId: workspace!.id } })
    expect(companies.length).toBeGreaterThanOrEqual(1)

    const company = companies.find(c => c.name === companyName) || companies[0]
    expect(company).toBeTruthy()
    expect(company.name).toBeTruthy()

    // The company from the API response should match the DB row
    if (completeRes.body.company?.id) {
      expect(completeRes.body.company.id).toBe(company.id)
    }

    // User's preferredHub should be set to OWNER
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } })
    expect(updatedUser!.preferredHub).toBe('OWNER')
  }, 60000)

  // ── ACCOUNTANT hub ────────────────────────────────────────────────────────

  it('ACCOUNTANT: accountant_firm step is written to OnboardingData and complete creates Workspace + Practice', async () => {
    const email = `onb-persist-acct-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist Accountant')

    const user = await prisma.user.findUnique({ where: { email } })
    expect(user).toBeTruthy()
    const userId = user!.id

    const firmName = `Ledger & Co ${Date.now()}`

    // ── 1. Save accountant_firm step ──────────────────────────────────────

    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'accountant_firm',
        data: {
          name: firmName,          // PracticeProfile sends `name`
          type: 'Small Firm',
          industry: 'General Practice',
          country: 'Philippines',
          currency: 'PHP',
          timezone: 'Asia/Manila',
        },
      })
      .expect([200, 201])

    // Assert step is in DB immediately
    let onb = await prisma.onboardingData.findUnique({ where: { userId } })
    expect(onb).toBeTruthy()
    expect(onb!.complete).toBe(false)
    const steps1 = onb!.steps as Record<string, any>
    expect(steps1.accountant_firm).toBeDefined()
    expect(steps1.accountant_firm.name).toBe(firmName)

    // ── 2. Save accountant_services step ─────────────────────────────────

    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'accountant_services',
        data: { bookkeeping: true, taxFiling: true, payroll: false, auditAssurance: false },
      })
      .expect([200, 201])

    onb = await prisma.onboardingData.findUnique({ where: { userId } })
    const steps2 = onb!.steps as Record<string, any>
    expect(steps2.accountant_services).toBeDefined()
    expect(steps2.accountant_services.bookkeeping).toBe(true)
    // Previous step still intact
    expect(steps2.accountant_firm.name).toBe(firmName)

    // ── 3. GET returns saved steps ────────────────────────────────────────

    const loadRes = await request(app.getHttpServer())
      .get('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const loaded = loadRes.body.steps as Record<string, any>
    expect(loaded.accountant_firm.name).toBe(firmName)
    expect(loaded.accountant_services.bookkeeping).toBe(true)

    // ── 4. Complete onboarding ─────────────────────────────────────────────

    const completeRes = await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'ACCOUNTANT' })
      .expect(200)

    expect(completeRes.body.success).toBe(true)

    // ── 5. DB assertions after complete ───────────────────────────────────

    // OnboardingData marked complete
    onb = await prisma.onboardingData.findUnique({ where: { userId } })
    expect(onb).toBeTruthy()
    expect(onb!.complete).toBe(true)

    // Step data preserved
    const finalSteps = onb!.steps as Record<string, any>
    expect(finalSteps.accountant_firm.name).toBe(firmName)

    // A Workspace must exist for this user
    const workspace = await prisma.workspace.findUnique({ where: { ownerUserId: userId } })
    expect(workspace).toBeTruthy()

    // A Practice must live under that Workspace with the correct name
    const practices = await prisma.practice.findMany({ where: { workspaceId: workspace!.id } })
    expect(practices.length).toBeGreaterThanOrEqual(1)

    const practice = practices.find(p => p.name === firmName) || practices[0]
    expect(practice).toBeTruthy()
    expect(practice.name).toBe(firmName)

    // User's preferredHub should be set to ACCOUNTANT
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } })
    expect(updatedUser!.preferredHub).toBe('ACCOUNTANT')
  }, 60000)

  // ── Step isolation / idempotency ──────────────────────────────────────────

  it('saving the same step twice overwrites the previous data (idempotent upsert)', async () => {
    const email = `onb-persist-idem-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist Idem')

    const user = await prisma.user.findUnique({ where: { email } })
    const userId = user!.id

    // First save
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { businessName: 'FirstName Co' } })
      .expect([200, 201])

    // Second save with different data for the same step
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { businessName: 'Updated Co', businessType: 'Retail' } })
      .expect([200, 201])

    const onb = await prisma.onboardingData.findUnique({ where: { userId } })
    const steps = onb!.steps as Record<string, any>
    // Should reflect the second save
    expect(steps.business.businessName).toBe('Updated Co')
    expect(steps.business.businessType).toBe('Retail')
    // Only one OnboardingData row per user
    const count = await prisma.onboardingData.count({ where: { userId } })
    expect(count).toBe(1)
  }, 30000)

  // ── Guard: complete without required step → 400 ───────────────────────────

  it('POST /api/onboarding/complete without saving any steps returns 400', async () => {
    const email = `onb-persist-nodata-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist NoData')

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(400)
  }, 30000)

  it('POST /api/onboarding/complete (ACCOUNTANT) without accountant_firm returns 400', async () => {
    const email = `onb-persist-acct-nodata-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist Acct NoData')

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'ACCOUNTANT' })
      .expect(400)
  }, 30000)

  // ── Saved steps survive a second call to GET /api/onboarding/save ─────────

  it('GET /api/onboarding/save returns steps that were previously saved', async () => {
    const email = `onb-persist-load-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Persist1234!', 'DB Persist Load')

    // Save two steps
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'business',
        data: { businessName: 'LoadTest Co', country: 'Philippines', industry: 'Retail' },
      })
      .expect([200, 201])

    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({
        step: 'fiscal_tax',
        data: { fiscalStart: 'January', currency: 'USD', taxRate: 0 },
      })
      .expect([200, 201])

    // Load and verify
    const res = await request(app.getHttpServer())
      .get('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const steps = res.body.steps as Record<string, any>
    expect(steps.business).toBeDefined()
    expect(steps.business.businessName).toBe('LoadTest Co')
    expect(steps.business.country).toBe('Philippines')

    expect(steps.fiscal_tax).toBeDefined()
    expect(steps.fiscal_tax.currency).toBe('USD')
    expect(steps.fiscal_tax.fiscalStart).toBe('January')
  }, 30000)
})
