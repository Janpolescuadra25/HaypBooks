import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { execSync } from 'child_process'
import * as path from 'path'
import * as bcrypt from '../src/utils/bcrypt-fallback'
import { AppModule } from '../src/app.module'
import { SubLedgerService } from '../src/shared/sub-ledger.service'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('AR invoice status state machine smoke e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient
  let token: string
  let companyId: string
  let customerId: string

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

    const email = `ar-invoice-status-${Date.now()}@haypbooks.test`
    const password = 'InvoiceStatus123!'
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: 'AR Invoice Status Smoke User',
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
        name: 'AR Invoice Status Smoke Co',
        currency: 'USD',
        isActive: true,
      },
    })
    companyId = company.id

    const contact = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        type: 'CUSTOMER',
        displayName: 'Invoice Status Customer',
      },
    })

    await prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        contactId: contact.id,
      },
    })
    customerId = contact.id

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

  async function createDraftInvoice(total: number, dueDate: string) {
    const res = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/invoices`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        dueDate,
        items: [{ description: 'Status test line', quantity: 1, unitPrice: total, amount: total }],
      })
      .expect(201)

    return res.body
  }

  async function sendInvoice(invoiceId: string) {
    const res = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/invoices/${invoiceId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200)

    return res.body
  }

  async function getInvoice(invoiceId: string) {
    const res = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/ar/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    return res.body
  }

  async function recordPayment(invoiceId: string, amount: number, reference: string) {
    const res = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        amount,
        paymentDate: new Date().toISOString().slice(0, 10),
        method: 'CASH',
        referenceNumber: reference,
        allocations: [{ invoiceId, amount }],
      })
      .expect(201)

    return res.body
  }

  it('transitions through SENT, PARTIALLY_PAID, PAID and handles payment reversals', async () => {
    const dueDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10)

    const draft = await createDraftInvoice(150, dueDate)
    expect(draft.status).toBe('DRAFT')

    const sent = await sendInvoice(draft.id)
    expect(sent.status).toBe('SENT')

    const firstPayment = await recordPayment(draft.id, 60, `STATE-P1-${Date.now()}`)
    expect(firstPayment.id).toBeTruthy()

    const partiallyPaid = await getInvoice(draft.id)
    expect(partiallyPaid.status).toBe('PARTIALLY_PAID')
    expect(Number(partiallyPaid.amountDue)).toBeCloseTo(90, 2)

    const secondPayment = await recordPayment(draft.id, 90, `STATE-P2-${Date.now()}`)
    expect(secondPayment.id).toBeTruthy()

    const paid = await getInvoice(draft.id)
    expect(paid.status).toBe('PAID')
    expect(Number(paid.amountDue)).toBeCloseTo(0, 2)

    await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments/${secondPayment.id}/void`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const backToPartial = await getInvoice(draft.id)
    expect(backToPartial.status).toBe('PARTIALLY_PAID')
    expect(Number(backToPartial.amountDue)).toBeCloseTo(90, 2)

    await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments/${firstPayment.id}/void`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const backToSent = await getInvoice(draft.id)
    expect(backToSent.status).toBe('SENT')
    expect(Number(backToSent.amountDue)).toBeCloseTo(150, 2)
  })

  it('auto-transitions eligible invoices to OVERDUE and keeps overdue state on partial/reversed payments', async () => {
    const overdueDueDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 10)

    const draft = await createDraftInvoice(80, overdueDueDate)
    await sendInvoice(draft.id)

    const overdue = await getInvoice(draft.id)
    expect(overdue.status).toBe('OVERDUE')

    const payment = await recordPayment(draft.id, 30, `OVERDUE-P1-${Date.now()}`)
    expect(payment.id).toBeTruthy()

    const stillOverdue = await getInvoice(draft.id)
    expect(stillOverdue.status).toBe('OVERDUE')
    expect(Number(stillOverdue.amountDue)).toBeCloseTo(50, 2)

    await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/ar/payments/${payment.id}/void`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const overdueAfterVoid = await getInvoice(draft.id)
    expect(overdueAfterVoid.status).toBe('OVERDUE')
    expect(Number(overdueAfterVoid.amountDue)).toBeCloseTo(80, 2)
  })
})
