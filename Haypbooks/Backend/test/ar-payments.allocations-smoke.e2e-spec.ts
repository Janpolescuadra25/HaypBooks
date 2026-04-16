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
  let token: string
  let customerId: string
  let invoiceId: string

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
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
})
