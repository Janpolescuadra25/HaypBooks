import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Workspace → Company & Practice e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.session.deleteMany({})
    await prisma.otp.deleteMany({})
    await prisma.user.deleteMany({ where: { email: { contains: 'e2e-wp' } } }).catch(() => {})
  })

  // ── Helper: full signup → verify OTP → get token ─────────────────────────
  async function signupAndGetToken(email: string, password: string, name: string, phone = '+1 555 100 0001') {
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password, name, phone })

    if (signupRes.body?.token) return signupRes.body.token

    const signupToken = signupRes.body?.signupToken
    if (!signupToken) throw new Error('No signupToken: ' + JSON.stringify(signupRes.body))

    const otpRow = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    if (!otpRow) throw new Error('No OTP row found')

    const completeRes = await request(app.getHttpServer())
      .post('/api/auth/complete-signup')
      .send({ signupToken, code: otpRow!.otpCode, method: 'email' })
      .expect(200)

    return completeRes.body.token
  }

  // ─────────────────────────────────────────────────────────────────────────
  it('owner onboarding creates a Workspace with a Company attached', async () => {
    const email = `e2e-wp-owner-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Owner1234!', 'WP Owner')

    // Complete OWNER onboarding (saves business step then marks complete)
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { companyName: 'OwnerCo Ltd' } })
      .expect([200, 201])

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    // Fetch the saved user to get their userId
    const user = await prisma.user.findUnique({ where: { email } })
    expect(user).toBeTruthy()

    // Workspace must exist and be OWNER type
    const workspace = await prisma.workspace.findUnique({ where: { ownerUserId: user!.id } })
    expect(workspace).toBeTruthy()
    expect(workspace!.type).toBe('OWNER')

    // At least one Company record must live under the workspace
    const companies = await prisma.company.findMany({ where: { workspaceId: workspace!.id } })
    expect(companies.length).toBeGreaterThanOrEqual(1)
    expect(companies[0].name).toBeTruthy()
  }, 30000)

  // ─────────────────────────────────────────────────────────────────────────
  it('can create an additional Company under the workspace via the API', async () => {
    const email = `e2e-wp-co2-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Owner1234!', 'WP Owner2')

    // Complete OWNER onboarding to create workspace
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { companyName: 'FirstCo LLC' } })
      .expect([200, 201])

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    const user = await prisma.user.findUnique({ where: { email } })
    const workspace = await prisma.workspace.findUnique({ where: { ownerUserId: user!.id } })
    expect(workspace).toBeTruthy()

    // Create a second company explicitly under the same workspace
    const createRes = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SecondCo Inc', workspaceId: workspace!.id })
      .expect(201)

    expect(createRes.body).toHaveProperty('id')
    expect(createRes.body.name).toBe('SecondCo Inc')

    // Both companies now visible under the workspace
    const companies = await prisma.company.findMany({ where: { workspaceId: workspace!.id } })
    expect(companies.length).toBeGreaterThanOrEqual(2)
    expect(companies.map((c: any) => c.name)).toContain('SecondCo Inc')
  }, 30000)

  // ─────────────────────────────────────────────────────────────────────────
  it('can create a Practice under the workspace and it appears in GET /api/users/me', async () => {
    const email = `e2e-wp-prac-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Owner1234!', 'WP Practice Owner')

    // Complete OWNER onboarding
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { companyName: 'MainCo Ltd' } })
      .expect([200, 201])

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    const user = await prisma.user.findUnique({ where: { email } })
    const workspace = await prisma.workspace.findUnique({ where: { ownerUserId: user!.id } })
    expect(workspace).toBeTruthy()

    // Create a Practice directly under the workspace (no REST API endpoint exists yet)
    const practice = await prisma.practice.create({
      data: {
        name: 'My Accounting Practice',
        workspaceId: workspace!.id,
        isActive: true,
      },
    })
    expect(practice.id).toBeTruthy()
    expect(practice.name).toBe('My Accounting Practice')
    expect(practice.workspaceId).toBe(workspace!.id)

    // Verify it appears in the user's profile
    const profileRes = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const practices: any[] = profileRes.body.practices || []
    const found = practices.find((p: any) => p.id === practice.id)
    expect(found).toBeTruthy()
    expect(found.name).toBe('My Accounting Practice')
  }, 30000)

  // ─────────────────────────────────────────────────────────────────────────
  it('workspace holds both Company and Practice simultaneously', async () => {
    const email = `e2e-wp-both-${Date.now()}@haypbooks.test`
    const token = await signupAndGetToken(email, 'Owner1234!', 'WP Both Owner')

    // Complete OWNER onboarding
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { companyName: 'DualEntity Inc' } })
      .expect([200, 201])

    await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    const user = await prisma.user.findUnique({ where: { email } })
    const workspace = await prisma.workspace.findUnique({
      where: { ownerUserId: user!.id },
      include: { companies: true, practices: true },
    })
    expect(workspace).toBeTruthy()

    // Onboarding already created at least one company
    expect(workspace!.companies.length).toBeGreaterThanOrEqual(1)

    // Now add a Practice
    await prisma.practice.create({
      data: {
        name: 'Dual Practice',
        workspaceId: workspace!.id,
        isActive: true,
      },
    })

    // Re-fetch workspace with relations
    const refreshed = await prisma.workspace.findUnique({
      where: { id: workspace!.id },
      include: { companies: true, practices: true },
    })

    expect(refreshed!.companies.length).toBeGreaterThanOrEqual(1)
    expect(refreshed!.practices.length).toBeGreaterThanOrEqual(1)

    // Confirm they share the same workspace
    expect(refreshed!.companies[0].workspaceId).toBe(workspace!.id)
    expect(refreshed!.practices[0].workspaceId).toBe(workspace!.id)

    // Verify both appear in the profile endpoint
    const profileRes = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(profileRes.body.companies.length).toBeGreaterThanOrEqual(1)
    expect(profileRes.body.practices.length).toBeGreaterThanOrEqual(1)
  }, 30000)
})
