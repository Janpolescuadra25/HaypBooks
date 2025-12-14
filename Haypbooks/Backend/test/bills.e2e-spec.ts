import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Bills API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authToken: string
  let tenantId: string
  let vendorId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    // Setup test data: create tenant, user, vendor
    const tenant = await prisma.tenant.upsert({ where: { subdomain: 'bills-test' }, update: {}, create: { name: 'Test Bills Company', subdomain: 'bills-test' } })
    tenantId = tenant.id

    // User will be created via the signup endpoint so we avoid direct DB upserts that
    // can conflict with API-level validations.

    // Create vendor contact and vendor record
    const vendor = await prisma.contact.create({ data: { tenantId, type: 'VENDOR', displayName: 'Test Vendor LLC' } })
    await prisma.vendor.create({ data: { contactId: vendor.id, tenantId } })
    vendorId = vendor.id

    // Ensure no existing user will conflict, then signup
    await prisma.user.deleteMany({ where: { email: 'bills-test@example.com' } })
    const signup = await request(app.getHttpServer()).post('/api/auth/signup').send({ email: 'bills-test@example.com', password: 'bills-pass', name: 'Bills Tester' }).expect(201)
    // login again to obtain a fresh token that the app recognizes
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'bills-test@example.com', password: 'bills-pass' }).expect(200)
    authToken = login.body.token
    // ensure this user is part of the test tenant so guarded endpoints work for tenantId
    await prisma.tenantUser.create({ data: { tenantId, userId: signup.body.user.id, role: 'ADMIN' } })
  })

  afterAll(async () => {
    // Cleanup - remove dependent child records first to satisfy FK constraints
    await prisma.billPayment.deleteMany({ where: { tenantId } })
    await prisma.billLine.deleteMany({ where: { bill: { tenantId } } })
    await prisma.bill.deleteMany({ where: { tenantId } })
    await prisma.vendor.deleteMany({ where: { tenantId } })
    await prisma.contact.deleteMany({ where: { tenantId } })
    await prisma.tenantUser.deleteMany({ where: { tenantId } })
    await prisma.user.deleteMany({ where: { email: 'bills-test@example.com' } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
    await app.close()
  })

  describe('POST /api/bills', () => {
    it('should create a bill with lines', async () => {
      const billData = {
        tenantId,
        vendorId,
        billNumber: 'BILL-001',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 1500.00,
        status: 'OPEN',
        lines: [
          {
            description: 'Office supplies',
            quantity: 10,
            unitPrice: 50.00,
            totalPrice: 500.00
          },
          {
            description: 'Software licenses',
            quantity: 5,
            unitPrice: 200.00,
            totalPrice: 1000.00
          }
        ]
      }

      const response = await request(app.getHttpServer()).post('/api/bills').set('Authorization', `Bearer ${authToken}`).send(billData).expect(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.billNumber).toBe('BILL-001')
      expect(Number(response.body.total)).toBe(1500)
      expect(Number(response.body.balance)).toBe(1500)
      expect(response.body.status).toBe('OPEN')
    })

    it('should reject bill without required fields', async () => {
      const invalidBill = {
        tenantId,
        // Missing vendorId
        billNumber: 'BILL-002'
      }

      await request(app.getHttpServer()).post('/api/bills').set('Authorization', `Bearer ${authToken}`).send(invalidBill).expect(400)
    })
  })

  describe('GET /api/bills/:id', () => {
    let billId: string

    beforeAll(async () => {
      // Create a test bill
      const bill = await prisma.bill.create({ data: { tenantId, vendorId, billNumber: 'BILL-GET-001', issuedAt: new Date(), dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), total: 1000, balance: 1000, status: 'OPEN', lines: { create: [{ tenantId, description: 'Test item', quantity: 1, rate: 1000, amount: 1000 }] } } })
      billId = bill.id
    })

    it('should retrieve a bill by id with lines', async () => {
        const response = await request(app.getHttpServer()).get(`/api/bills/${billId}`).set('Authorization', `Bearer ${authToken}`).expect(200)

      expect(response.body.id).toBe(billId)
      expect(response.body.billNumber).toBe('BILL-GET-001')
      expect(response.body.lines).toHaveLength(1)
      expect(response.body.lines[0].description).toBe('Test item')
    })

    it('should return 404 for non-existent bill', async () => {
      await request(app.getHttpServer()).get('/api/bills/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${authToken}`).expect(404)
    })
  })

  describe('GET /api/bills', () => {
    beforeAll(async () => {
      // Create multiple test bills
      await prisma.bill.create({ data: { tenantId, vendorId, billNumber: 'BILL-LIST-001', issuedAt: new Date(), total: 500, balance: 500, status: 'OPEN' } })
      await prisma.bill.create({ data: { tenantId, vendorId, billNumber: 'BILL-LIST-002', issuedAt: new Date(), total: 750, balance: 0, status: 'PAID' } })
      const response = await request(app.getHttpServer()).get('/api/bills').set('Authorization', `Bearer ${authToken}`).query({ tenantId }).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
    })

    it('should filter bills by status', async () => {
      const response = await request(app.getHttpServer()).get('/api/bills').set('Authorization', `Bearer ${authToken}`).query({ tenantId, status: 'OPEN' }).expect(200)

      expect(response.body.every(b => b.status === 'OPEN')).toBe(true)
    })
  })

  describe('Bill Payment Application', () => {
    let billId: string

    beforeAll(async () => {
      const bill = await prisma.bill.create({ data: { tenantId, vendorId, billNumber: 'BILL-PAY-001', issuedAt: new Date(), total: 2000, balance: 2000, status: 'OPEN' } })
      billId = bill.id
    })

    it('should apply payment to bill and update balance', async () => {
      const paymentData = {
        billId,
        amount: 500,
        paymentDate: new Date().toISOString(),
        paymentMethod: 'CHECK',
        referenceNumber: 'CHK-1001'
      }

      const response = await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...paymentData, tenantId }).expect(201)

      expect(response.body).toHaveProperty('id')
      expect(Number(response.body.amount)).toBe(500)

      // Verify bill balance was updated
      const updatedBill = await prisma.bill.findUnique({ where: { id: billId } })
      expect(updatedBill!.balance.toNumber()).toBe(1500)
    })

    it('should mark bill as PAID when fully paid', async () => {
      const paymentData = {
        billId,
        amount: 1500, // Pay remaining balance
        paymentDate: new Date().toISOString(),
        paymentMethod: 'ACH'
      }

      await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...paymentData, tenantId }).expect(201)

      const paidBill = await prisma.bill.findUnique({ where: { id: billId } })
      expect(paidBill!.balance.toNumber()).toBe(0)
      expect(paidBill!.status).toBe('PAID')
    })

    it('should reject overpayment', async () => {
      const overpaymentData = {
        billId,
        amount: 100, // Bill already fully paid
        paymentDate: new Date().toISOString()
      }

      await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...overpaymentData, tenantId }).expect(400)
    })
  })
})
