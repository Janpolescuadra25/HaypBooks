import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import * as bcrypt from '../src/utils/bcrypt-fallback'
import { SubLedgerService } from '../src/shared/sub-ledger.service'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('AR Payments allocations smoke e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient
  let companyId: string
  let workspaceId: string
  let token: string
  let customerId: string
  let invoiceId: string
  let bankAccountId: string

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SubLedgerService)
      .useValue({
        postInvoiceToGL: async () => undefined,
        reverseInvoiceGL: async () => undefined,
        postPaymentReceivedToGL: async () => undefined,
        reversePaymentReceivedGL: async () => undefined,
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()

    // Ensure core account types exist for sub-ledger posting
    for (const [id, name, normalSide] of [
      [1, 'ASSET', 'DEBIT'],
      [2, 'EXPENSE', 'DEBIT'],
      [3, 'INCOME', 'CREDIT'],
      [4, 'LIABILITY', 'CREDIT'],
      [5, 'EQUITY', 'CREDIT'],
    ] as [number, string, string][]) {
      await prisma.accountType.upsert({
        where: { id },
        update: { normalSide: normalSide as any },
        create: { id, name, normalSide: normalSide as any },
      })
    }

    const email = `ar-payment-smoke-${Date.now()}@haypbooks.test`
    const password = 'SmokePay123!'
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: 'AR Payment Smoke User',
        password: passwordHash,
        isEmailVerified: true,
      },
    })

    const workspace = await prisma.workspace.create({
      data: {
        ownerUserId: user.id,
        type: 'OWNER',
        status: 'ACTIVE',
        baseCurrency: 'USD',
      },
    })
    workspaceId = workspace.id

    const role = await prisma.role.create({
      data: {
        workspaceId: workspace.id,
        name: 'Owner',
      },
    })

    await prisma.workspaceUser.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        roleId: role.id,
        isOwner: true,
        status: 'ACTIVE',
      },
    })

    const company = await prisma.company.create({
      data: {
        workspaceId: workspace.id,
        name: 'AR Payment Smoke Co',
        currency: 'USD',
        isActive: true,
      },
    })
    companyId = company.id

    const bankAccount = await prisma.bankAccount.create({
      data: {
        workspaceId: workspace.id,
        name: 'Smoke Bank Account',
        institution: 'Smoke Bank',
        accountNumber: `****${String(Date.now()).slice(-4)}`,
        isDefault: true,
      },
      select: { id: true },
    })
    bankAccountId = bankAccount.id

    const contact = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        type: 'CUSTOMER',
        displayName: 'Smoke Customer',
      },
    })

    await prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        contactId: contact.id,
      },
    })
    customerId = contact.id

    const invoice = await prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        companyId,
        customerId,
        invoiceNumber: `INV-SMOKE-${Date.now()}`,
        date: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalAmount: 150,
        balance: 150,
        status: 'SENT',
        postingStatus: 'DRAFT',
        currency: 'USD',
        createdById: user.id,
      },
    })
    invoiceId = invoice.id

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)

    token = login.body.token
    expect(token).toBeTruthy()
  }, 120000)

  afterAll(async () => {
    await app?.close()
    await prisma?.$disconnect()
  })

  it('POST /api/companies/:companyId/ar/payments with allocations returns 201 for method CASH', async () => {
    const paymentDate = new Date().toISOString().slice(0, 10)

    const res = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount: 100,
        paymentDate,
        method: 'CASH',
        referenceNumber: 'SMOKE-ALLOC',
        allocations: [{ invoiceId, amount: 100 }],
      })
      .expect(201)

    expect(res.body).toHaveProperty('id')
    expect(res.body.customerId).toBe(customerId)
    expect(res.body.totalAllocated).toBeCloseTo(100, 2)
    expect(res.body.unappliedAmount).toBeCloseTo(0, 2)
    expect(Array.isArray(res.body.allocations)).toBe(true)
    expect(res.body.allocations[0].invoiceId).toBe(invoiceId)
    expect(res.body.allocations[0].amount).toBeCloseTo(100, 2)
    expect(res.body.method).toBe('CASH')
  })

  it('POST /api/companies/:companyId/ar/payments returns 400 with a clear validation message when allocations exceed payment amount', async () => {
    const paymentDate = new Date().toISOString().slice(0, 10)

    const res = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount: 50,
        paymentDate,
        method: 'CASH',
        referenceNumber: 'SMOKE-OVER-ALLOC',
        allocations: [{ invoiceId, amount: 100 }],
      })
      .expect(400)

    const message = Array.isArray(res.body?.message)
      ? res.body.message.join(' ')
      : String(res.body?.message ?? '')

    expect(message.toLowerCase()).toContain('total allocated')
    expect(message.toLowerCase()).toContain('exceeds payment amount')
  })

  it('PUT /api/companies/:companyId/ar/payments/:paymentId replaces allocations and clears unapplied balance', async () => {
    const paymentDate = new Date().toISOString().slice(0, 10)
    const seed = Date.now()

    const invoiceA = await prisma.invoice.create({
      data: {
        workspaceId,
        companyId,
        customerId,
        invoiceNumber: `INV-REALLOC-A-${seed}`,
        date: new Date(),
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        totalAmount: 150,
        balance: 150,
        status: 'SENT',
        postingStatus: 'DRAFT',
        currency: 'USD',
      },
    })

    const invoiceB = await prisma.invoice.create({
      data: {
        workspaceId,
        companyId,
        customerId,
        invoiceNumber: `INV-REALLOC-B-${seed}`,
        date: new Date(),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        totalAmount: 120,
        balance: 120,
        status: 'SENT',
        postingStatus: 'DRAFT',
        currency: 'USD',
      },
    })

    const created = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount: 120,
        paymentDate,
        method: 'CASH',
        referenceNumber: `SMOKE-REALLOC-${Date.now()}`,
        allocations: [{ invoiceId: invoiceA.id, amount: 70 }],
      })
      .expect(201)

    expect(created.body.unappliedAmount).toBeCloseTo(50, 2)

    const paymentId = created.body.id as string
    expect(paymentId).toBeTruthy()

    const reallocated = await request(app.getHttpServer())
      .put(`/api/companies/${companyId}/ar/payments/${paymentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        allocations: [
          { invoiceId: invoiceA.id, amount: 70 },
          { invoiceId: invoiceB.id, amount: 50 },
        ],
      })
      .expect(200)

    expect(reallocated.body.totalAllocated).toBeCloseTo(120, 2)
    expect(reallocated.body.unappliedAmount).toBeCloseTo(0, 2)
    expect(Array.isArray(reallocated.body.allocations)).toBe(true)
    expect(reallocated.body.allocations).toHaveLength(2)
    expect(reallocated.body.allocations.some((a: any) => a.invoiceId === invoiceA.id && Number(a.amount) === 70)).toBe(true)
    expect(reallocated.body.allocations.some((a: any) => a.invoiceId === invoiceB.id && Number(a.amount) === 50)).toBe(true)

    const refreshedOne = await prisma.invoice.findUnique({ where: { id: invoiceA.id } })
    const refreshedTwo = await prisma.invoice.findUnique({ where: { id: invoiceB.id } })

    expect(Number(refreshedOne?.balance ?? -1)).toBeCloseTo(80, 2)
    expect(Number(refreshedTwo?.balance ?? -1)).toBeCloseTo(70, 2)
  })

  it('moves undeposited payments into a bank deposit and updates payment status to deposited', async () => {
    const paymentDate = new Date().toISOString().slice(0, 10)
    const seed = Date.now()

    const invoiceC = await prisma.invoice.create({
      data: {
        workspaceId,
        companyId,
        customerId,
        invoiceNumber: `INV-DEPOSIT-C-${seed}`,
        date: new Date(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalAmount: 90,
        balance: 90,
        status: 'SENT',
        postingStatus: 'DRAFT',
        currency: 'USD',
      },
    })

    const invoiceD = await prisma.invoice.create({
      data: {
        workspaceId,
        companyId,
        customerId,
        invoiceNumber: `INV-DEPOSIT-D-${seed}`,
        date: new Date(),
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        totalAmount: 75,
        balance: 75,
        status: 'SENT',
        postingStatus: 'DRAFT',
        currency: 'USD',
      },
    })

    const paymentOne = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount: 60,
        paymentDate,
        method: 'CASH',
        referenceNumber: `SMOKE-DEP-1-${seed}`,
        allocations: [{ invoiceId: invoiceC.id, amount: 60 }],
      })
      .expect(201)

    const paymentTwo = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount: 40,
        paymentDate,
        method: 'CHECK',
        referenceNumber: `SMOKE-DEP-2-${seed}`,
        allocations: [{ invoiceId: invoiceD.id, amount: 40 }],
      })
      .expect(201)

    expect(paymentOne.body.isDeposited).toBe(false)
    expect(paymentTwo.body.isDeposited).toBe(false)
    expect(paymentOne.body.depositStatus).toBe('UNDEPOSITED')
    expect(paymentTwo.body.depositStatus).toBe('UNDEPOSITED')

    const undepositedBefore = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/banking/undeposited-funds`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const undepositedIds = new Set((undepositedBefore.body ?? []).map((row: any) => row.id))
    expect(undepositedIds.has(paymentOne.body.id)).toBe(true)
    expect(undepositedIds.has(paymentTwo.body.id)).toBe(true)

    const deposit = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/banking/deposits`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bankAccountId,
        depositDate: paymentDate,
        referenceNumber: `SMOKE-DEPOSIT-${seed}`,
        paymentIds: [paymentOne.body.id, paymentTwo.body.id],
      })
      .expect(201)

    expect(deposit.body).toHaveProperty('id')
    expect(deposit.body.status).toBe('DRAFT')

    const refreshedOne = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/ar/payments/${paymentOne.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const refreshedTwo = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/ar/payments/${paymentTwo.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(refreshedOne.body.isDeposited).toBe(true)
    expect(refreshedTwo.body.isDeposited).toBe(true)
    expect(refreshedOne.body.depositStatus).toBe('DEPOSITED')
    expect(refreshedTwo.body.depositStatus).toBe('DEPOSITED')
    expect(refreshedOne.body.depositDate).toBeTruthy()
    expect(refreshedTwo.body.depositDate).toBeTruthy()

    const undepositedAfter = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/banking/undeposited-funds`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const undepositedAfterIds = new Set((undepositedAfter.body ?? []).map((row: any) => row.id))
    expect(undepositedAfterIds.has(paymentOne.body.id)).toBe(false)
    expect(undepositedAfterIds.has(paymentTwo.body.id)).toBe(false)
  })
})
