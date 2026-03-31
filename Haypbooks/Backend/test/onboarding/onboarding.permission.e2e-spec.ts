import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import * as bcrypt from 'bcryptjs'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/repositories/prisma/prisma.service'

describe('Onboarding and company permissions integration', () => {
  let app: INestApplication
  let prisma: PrismaService
  const testEmail = `int-onboard-${Date.now()}@haypbooks.test`
  const testPassword = 'Password123!'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    prisma = app.get(PrismaService)

    await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {})
    await app.close()
  })

  it('should create workspace user link on onboarding complete and allow seed-default', async () => {
    // signup & complete-signup
    const signup = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: testEmail, password: testPassword, name: 'Test Owner', phone: '+15555501001' })
      .expect(201)

    expect(signup.body.signupToken).toBeDefined()
    expect(signup.body.otp).toBeDefined()

    const complete = await request(app.getHttpServer())
      .post('/api/auth/complete-signup')
      .send({ signupToken: signup.body.signupToken, code: signup.body.otp, method: 'email' })
      .expect(200)

    expect(complete.body.token).toBeDefined()
    const token = complete.body.token

    // onboarding business + complete
    await request(app.getHttpServer())
      .post('/api/onboarding/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ step: 'business', data: { companyName: 'Test Co', businessName: 'Test Co' } })
      .expect(201)

    const onboardingComplete = await request(app.getHttpServer())
      .post('/api/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'full', hub: 'OWNER' })
      .expect(200)

    const company = onboardingComplete.body.company
    expect(company).toBeTruthy()
    expect(company.id).toBeDefined()
    expect(company.workspaceId).toBeDefined()

    // WorkspaceUser membership should exist and be active
    const wsUser = await prisma.workspaceUser.findFirst({
      where: { workspaceId: company.workspaceId, userId: complete.body.user.id },
    })
    expect(wsUser).toBeTruthy()
    expect(wsUser?.status).toBe('ACTIVE')
    expect(wsUser?.isOwner).toBe(true)

    // seed-default must succeed for owner
    const seed1 = await request(app.getHttpServer())
      .post(`/api/companies/${company.id}/accounting/accounts/seed-default`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(seed1.body.message).toContain('Default Chart of Accounts seeded successfully')

    // Second call should be idempotent
    const seed2 = await request(app.getHttpServer())
      .post(`/api/companies/${company.id}/accounting/accounts/seed-default`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(seed2.body.message).toContain('already seeded')

    // verify account exists in DB for company and no duplicates exist for unique code
    const cashAccounts = await prisma.account.findMany({ where: { companyId: company.id, code: '1010' } })
    expect(cashAccounts.length).toBe(1)

    // owner dashboard summary should reflect data
    const ownerDashboard = await request(app.getHttpServer())
      .get('/api/owner/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(ownerDashboard.body.companyName).toBe(company.name)
    expect(ownerDashboard.body.isCoASeeded).toBe(true)
    expect(ownerDashboard.body.activeUserCount).toBeGreaterThanOrEqual(1)

    // workspace-users should list at least owner
    const workspaceUsers = await request(app.getHttpServer())
      .get(`/api/companies/${company.id}/workspace-users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(workspaceUsers.body)).toBe(true)
    expect(workspaceUsers.body.some((u: any) => u.user?.id === complete.body.user.id)).toBe(true)

    // non-owner user should be forbidden from seeding
    const secondEmail = `int-onboard-${Date.now()}-2@haypbooks.test`
    const signup2 = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: secondEmail, password: testPassword, name: 'Non Owner', phone: '+15555501002' })
      .expect(201)

    const complete2 = await request(app.getHttpServer())
      .post('/api/auth/complete-signup')
      .send({ signupToken: signup2.body.signupToken, code: signup2.body.otp, method: 'email' })
      .expect(200)

    const secondToken = complete2.body.token
    // grant non-owner membership in same workspace, active
    await prisma.workspaceUser.create({
      data: {
        workspaceId: company.workspaceId,
        userId: complete2.body.user.id,
        roleId: wsUser?.roleId ?? '',
        isOwner: false,
        status: 'ACTIVE',
      },
    })

    await request(app.getHttpServer())
      .post(`/api/companies/${company.id}/accounting/accounts/seed-default`)
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(403)

    // Invite a fresh user and confirm invite auto-activates on login
    const invitedEmail = `invite-${Date.now()}@haypbooks.test`
    await request(app.getHttpServer())
      .post(`/api/companies/${company.id}/workspace-users`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: invitedEmail, roleId: wsUser?.roleId })
      .expect(201)

    const invitedUser = await prisma.user.findUnique({ where: { email: invitedEmail } })
    expect(invitedUser).toBeTruthy()

    const hashed = await bcrypt.hash('Password123!', 10)
    await prisma.user.update({ where: { id: invitedUser!.id }, data: { password: hashed, isEmailVerified: true } })

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: invitedEmail, password: 'Password123!' })
      .expect(200)

    const invitedWsUser = await prisma.workspaceUser.findFirst({
      where: { userId: invitedUser!.id, workspaceId: company.workspaceId }
    })
    expect(invitedWsUser?.status).toBe('ACTIVE')
  })
})
