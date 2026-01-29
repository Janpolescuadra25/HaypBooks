import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Bills API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let authToken: string
  let workspaceId: string
  let vendorId: string | undefined
  let companyId: string | undefined
  let createUserId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    // Setup test data will be created after the test user signs up

    // Ensure no existing user will conflict and create a verified test user
    try { await prisma.user.deleteMany({ where: { email: 'bills-test@example.com' } }) } catch (e) { /* ignore FK / owner references in legacy Tenant table */ }
    const createUser = await request(app.getHttpServer()).post('/api/test/create-user').send({ email: 'bills-test@example.com', password: 'bills-pass', name: 'Bills Tester', isEmailVerified: true }).expect(201)
    // login to obtain token
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'bills-test@example.com', password: 'bills-pass' }).expect(200)
    authToken = login.body.token

    // Create a workspace owned by this user, a default ADMIN role, a test company and a vendor
    const workspace = await prisma.workspace.create({ data: { ownerUserId: createUser.body.id } })
    workspaceId = workspace.id
    let role = await prisma.role.findFirst({ where: { workspaceId, name: 'ADMIN' } })
    if (!role) {
      // Fallback raw insert to handle intermediate migration columns (tenantId_new) that Prisma may not manage
      const rows: any[] = await prisma.$queryRawUnsafe(`INSERT INTO public."Role" ("id", "tenantId", "tenantId_new", "name", "createdAt") VALUES (gen_random_uuid(), $1::uuid, $1::uuid, $2, now()) RETURNING *`, workspaceId, 'ADMIN')
      role = rows && rows.length ? rows[0] : await prisma.role.findFirst({ where: { workspaceId, name: 'ADMIN' } })
    }
    const country = await prisma.country.findFirst()
    const countryId = country ? country.id : (await prisma.country.create({ data: { code: 'US', name: 'United States' } })).id
    const companyRows: any[] = await prisma.$queryRawUnsafe(`INSERT INTO public."Company" ("id", "tenantId", "tenantId_new", "countryId", "name", "createdAt") VALUES (gen_random_uuid(), $1::uuid, $1::uuid, $2, $3, now()) RETURNING *`, workspaceId, countryId, 'Test Company')
    companyId = companyRows && companyRows.length ? companyRows[0].id : undefined
    const contactRows: any[] = await prisma.$queryRawUnsafe(`INSERT INTO public."Contact" ("id", "tenantId", "tenantId_new", "type", "displayName", "createdAt") VALUES (gen_random_uuid(), $1::uuid, $1::uuid, $2, $3, now()) RETURNING *`, workspaceId, 'VENDOR', 'Test Vendor LLC')
    const vendorContact = contactRows && contactRows.length ? contactRows[0] : null
    if (vendorContact) {
      await prisma.$queryRawUnsafe(`INSERT INTO public."Vendor" ("contactId", "tenantId", "tenantId_new") VALUES ($1, $2::uuid, $2::uuid) RETURNING *`, vendorContact.id, workspaceId)
      vendorId = vendorContact.id
    } else {
      vendorId = undefined
    }

    // Add the user as an owner of the workspace
    createUserId = createUser.body.id
    await prisma.workspaceUser.create({ data: { workspace: { connect: { id: workspaceId } }, user: { connect: { id: createUserId } }, Role: { connect: { id: (role as any).id } }, isOwner: true } })
  })

  afterAll(async () => {
    // Resilient cleanup - delete in a safe order and ignore individual failures
    try { await prisma.billPayment.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup billPayment failed', e) }
    try { await prisma.bill.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup bills failed', e) }
    try { await prisma.vendor.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup vendors failed', e) }
    try { await prisma.contact.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup contacts failed', e) }
    try { await prisma.workspaceUser.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup workspaceUsers failed', e) }
    try { await prisma.company.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup companies failed', e) }
    try { await prisma.role.deleteMany({ where: { workspaceId } }) } catch (e) { console.warn('cleanup roles failed', e) }
    try { if (createUserId) await prisma.tenant.deleteMany({ where: { ownerUserId: createUserId } }) } catch (e) { /* ignore */ }
    try { await prisma.workspace.deleteMany({ where: { id: workspaceId } }) } catch (e) { console.warn('cleanup workspace failed', e) }
    try { await prisma.user.deleteMany({ where: { email: 'bills-test@example.com' } }) } catch (e) { console.warn('cleanup users failed', e) }
    await app.close()
  })

  describe('POST /api/bills', () => {
    it('should create a bill with lines', async () => {
      const billData = {
        workspaceId,
        vendorId,
        billNumber: 'BILL-001',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 1500.00,
        status: 'DRAFT',
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
      expect(response.body.status).toBe('DRAFT')
    })

    it('should reject bill without required fields', async () => {
      const invalidBill = {
        workspaceId,
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
      const bill = await prisma.bill.create({ data: { workspace: { connect: { id: workspaceId } }, vendor: { connect: { contactId: vendorId } }, company: { connect: { id: companyId } }, billNumber: 'BILL-GET-001', issuedAt: new Date(), dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), total: 1000, balance: 1000, status: 'DRAFT', lines: { create: [{ workspace: { connect: { id: workspaceId } }, company: { connect: { id: companyId } }, description: 'Test item', quantity: 1, rate: 1000, amount: 1000 }] } } })
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
      await prisma.bill.create({ data: { workspace: { connect: { id: workspaceId } }, vendor: { connect: { contactId: vendorId } }, company: { connect: { id: companyId } }, billNumber: 'BILL-LIST-001', issuedAt: new Date(), total: 500, balance: 500, status: 'DRAFT' } })
      await prisma.bill.create({ data: { workspace: { connect: { id: workspaceId } }, vendor: { connect: { contactId: vendorId } }, company: { connect: { id: companyId } }, billNumber: 'BILL-LIST-002', issuedAt: new Date(), total: 750, balance: 0, status: 'PAID' } })
      const response = await request(app.getHttpServer()).get('/api/bills').set('Authorization', `Bearer ${authToken}`).query({ workspaceId }).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2)
    })

    it('should filter bills by status', async () => {
      const response = await request(app.getHttpServer()).get('/api/bills').set('Authorization', `Bearer ${authToken}`).query({ workspaceId, status: 'DRAFT' }).expect(200)

      expect(response.body.every(b => b.status === 'DRAFT')).toBe(true)
    })
  })

  describe('Bill Payment Application', () => {
    let billId: string

    beforeAll(async () => {
      const bill = await prisma.bill.create({ data: { workspace: { connect: { id: workspaceId } }, vendor: { connect: { contactId: vendorId } }, company: { connect: { id: companyId } }, billNumber: 'BILL-PAY-001', issuedAt: new Date(), total: 2000, balance: 2000, status: 'DRAFT' } })
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

      const response = await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...paymentData, workspaceId }).expect(201)

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

      await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...paymentData, workspaceId }).expect(201)

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

      await request(app.getHttpServer()).post(`/api/bills/${billId}/payments`).set('Authorization', `Bearer ${authToken}`).send({ ...overpaymentData, workspaceId }).expect(400)
    })
  })
})
