import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Purchase Orders (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string
  let itemId: string
  let locationId: string
  let poId: string
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    // Create tenant and data
    const tenant = await prisma.tenant.create({ data: { name: 'PO E2E', subdomain: `poi-${Math.random().toString(36).slice(2, 7)}` } })
    tenantId = tenant.id
    const loc = await prisma.stockLocation.create({ data: { tenantId, name: 'Main' } })
    locationId = loc.id
    const item = await prisma.item.create({ data: { tenantId, sku: 'POITEM-001', name: 'PO Item', type: 'INVENTORY' } })
    itemId = item.id

    // Create accounts and map
    const assetAcct = await prisma.account.create({ data: { tenantId, code: '1401', name: 'Inv Asset PO', typeId: 1 } })
    const cogsAcct = await prisma.account.create({ data: { tenantId, code: '5101', name: 'COGS PO', typeId: 2 } })
    await prisma.item.update({ where: { id: item.id }, data: { inventoryAssetAccountId: assetAcct.id, cogsAccountId: cogsAcct.id } })

    // create a test user and login to receive JWT
    const testEmail = `po-${Math.random().toString(36).slice(2, 7)}@example.com`
    await request(app.getHttpServer()).post('/api/test/create-user').send({ email: testEmail, password: 'secret', name: 'PO Tester', isEmailVerified: true }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: testEmail, password: 'secret' }).expect(200)
    authToken = login.body.token
  })

  afterAll(async () => {
    // cleanup
    await prisma.journalEntryLine.deleteMany({ where: { journal: { tenantId } } })
    await prisma.journalEntry.deleteMany({ where: { tenantId } })
    await prisma.inventoryTransactionLine.deleteMany({ where: { tenantId } })
    await prisma.inventoryTransaction.deleteMany({ where: { tenantId } })
    await prisma.stockLevel.deleteMany({ where: { tenantId } })
    await prisma.inventoryCostLayer.deleteMany({ where: { tenantId } })
    await prisma.stockLocation.deleteMany({ where: { tenantId } })
    await prisma.item.deleteMany({ where: { tenantId } })
    await prisma.account.deleteMany({ where: { tenantId } })
    // Delete purchase orders and their lines
    const pos = await prisma.purchaseOrder.findMany({ where: { tenantId } })
    const poIds = pos.map(p => p.id)
    if (poIds.length) await prisma.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: { in: poIds } } })
    await prisma.purchaseOrder.deleteMany({ where: { tenantId } })
    await prisma.vendor.deleteMany({ where: { tenantId } })
    await prisma.contact.deleteMany({ where: { tenantId } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })

    await app.close()
  })

  it('should create PO and receive it into stock', async () => {
    // create PO
    const contact = await prisma.contact.create({ data: { tenantId, type: 'VENDOR', displayName: 'Vendor PO' } })
    const vendor = await prisma.vendor.create({ data: { contactId: contact.id, tenantId } })
    const invSuspense = await prisma.account.create({ data: { tenantId, code: 'INV-SUSPENSE', name: 'Inventory Suspense PO', typeId: 5 } })
    const poPayload = {
      tenantId,
      vendorId: vendor.contactId,
      poNumber: 'PO-001',
      total: 1200,
      lines: [{ itemId, quantity: 12, rate: 100, amount: 1200 }]
    }
    const res = await request(app.getHttpServer()).post('/api/purchase-orders').set('Authorization', `Bearer ${authToken}`).send(poPayload).expect(201)
    poId = res.body.id

    // receive the PO
    const receivePayload = { tenantId, transactionNumber: 'PO-RCPT-001', stockLocationId: locationId }
    const r = await request(app.getHttpServer()).post(`/api/purchase-orders/${poId}/receive`).set('Authorization', `Bearer ${authToken}`).send(receivePayload).expect(201)

    // Verify inventory transaction was created and stock levels updated
    const sl = await prisma.stockLevel.findFirst({ where: { tenantId, itemId } })
    expect(sl).toBeTruthy()
    if (!sl) throw new Error('Stocklevel missing')
    expect(sl.quantity.toNumber()).toBe(12)

    // PO should be marked as RECEIVED
    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } })
    expect(po).toBeTruthy()
    if (!po) throw new Error('PO not found')
    expect(po.status).toBe('RECEIVED')
  })
})
