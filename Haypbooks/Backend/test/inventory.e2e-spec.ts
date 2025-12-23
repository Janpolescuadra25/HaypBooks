import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'
import { retryRequest } from './http.retry'

describe('Inventory API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string
  let itemId: string
  let locationId: string
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    // Create tenant and test data
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Inventory E2E Test',
        subdomain: `inv-e2e-${Math.random().toString(36).slice(2, 7)}`
      }
    })
    tenantId = tenant.id

    const location = await prisma.stockLocation.create({ data: { tenantId, name: 'Main' } })
    locationId = location.id

    const item = await prisma.item.create({ data: { tenantId, sku: 'E2E-001', name: 'E2E Widget', type: 'INVENTORY' } })
    // create accounts
    const assetAcct = await prisma.account.create({ data: { tenantId, code: '1400', name: 'Inventory Asset (E2E)', typeId: 1 } })
    const cogsAcct = await prisma.account.create({ data: { tenantId, code: '5100', name: 'COGS (E2E)', typeId: 2 } })
    const invSuspense = await prisma.account.create({ data: { tenantId, code: 'INV-SUSPENSE', name: 'Inventory Suspense (E2E)', typeId: 5 } })
    await prisma.item.update({ where: { id: item.id }, data: { inventoryAssetAccountId: assetAcct.id, cogsAccountId: cogsAcct.id } })

    // create a test user and login to receive JWT
    const testEmail = `invtest-${Math.random().toString(36).slice(2, 7)}@example.com`
    await request(app.getHttpServer()).post('/api/test/create-user').send({ email: testEmail, password: 'secret', name: 'Inv Tester' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: testEmail, password: 'secret' }).expect(200)
    authToken = login.body.token
    itemId = item.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.inventoryTransactionLine.deleteMany({ where: { tenantId } })
    await prisma.inventoryTransaction.deleteMany({ where: { tenantId } })
    await prisma.stockLevel.deleteMany({ where: { tenantId } })
    await prisma.stockLocation.deleteMany({ where: { tenantId } })
    await prisma.inventoryCostLayer.deleteMany({ where: { tenantId } })
    await prisma.item.deleteMany({ where: { tenantId } })
    await prisma.journalEntryLine.deleteMany({ where: { journal: { tenantId } } })
    await prisma.journalEntry.deleteMany({ where: { tenantId } })
    await prisma.account.deleteMany({ where: { tenantId } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
    await app.close()
  })

  it('should receive stock and update levels', async () => {
    const payload = {
      tenantId,
      transactionNumber: 'RCPT-E2E-01',
      type: 'RECEIPT',
      lines: [{ itemId, stockLocationId: locationId, qty: 20, unitCost: 5 }]
    }

    const res = await retryRequest(() => request(app.getHttpServer()).post('/api/inventory/receive').set('Authorization', `Bearer ${authToken}`).send(payload), 3, 300)
    if (res.status !== 201) console.error('Inventory receive failed after retries:', res.status, res.body)
    expect(res.status).toBe(201)

    expect(res.body).toHaveProperty('id')

    const sl = await prisma.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId: locationId } } })
    expect(sl).toBeTruthy()
    if (!sl) throw new Error('Stock level missing')
    expect(sl.quantity.toNumber()).toBe(20)

    // Verify JournalEntry created for inventory receipt
    const je = await prisma.journalEntry.findFirst({ where: { tenantId, description: { contains: 'Inventory receipt' } } })
    expect(je).toBeTruthy()
    if (!je) throw new Error('Journal entry missing')
    const lines = await prisma.journalEntryLine.findMany({ where: { journalId: je.id } })
    // Sum debit and credit
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit), 0)
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit), 0)
    expect(Math.abs(totalDebit - totalCredit)).toBeLessThan(0.0001)
  })

  it('should ship stock and decrement levels', async () => {
    const payload = {
      tenantId,
      transactionNumber: 'SHIP-E2E-01',
      lines: [{ itemId, stockLocationId: locationId, qty: 10 }]
    }

    const res = await retryRequest(() => request(app.getHttpServer()).post('/api/inventory/ship').set('Authorization', `Bearer ${authToken}`).send(payload), 3, 300)
    if (res.status !== 201) console.error('Inventory ship failed after retries:', res.status, res.body)
    expect(res.status).toBe(201)

    expect(res.body).toHaveProperty('id')

    const sl = await prisma.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId: locationId } } })
    expect(sl).toBeTruthy()
    if (!sl) throw new Error('Stock level missing')
    expect(sl.quantity.toNumber()).toBe(10)

    // Verify JournalEntry for COGS
    const je = await prisma.journalEntry.findFirst({ where: { tenantId, description: { contains: 'COGS for shipment' } } })
    expect(je).toBeTruthy()
    if (!je) throw new Error('COGS Journal entry missing')
    const lines = await prisma.journalEntryLine.findMany({ where: { journalId: je.id } })
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit), 0)
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit), 0)
    expect(Math.abs(totalDebit - totalCredit)).toBeLessThan(0.0001)
  })

  it('should reject over-shipment', async () => {
    const payload = { tenantId, transactionNumber: 'SHIP-E2E-02', lines: [{ itemId, stockLocationId: locationId, qty: 20 }] }
    await request(app.getHttpServer()).post('/api/inventory/ship').set('Authorization', `Bearer ${authToken}`).send(payload).expect(400)
  })

  it('should transfer stock between locations', async () => {
    // create destination
    const dest = await prisma.stockLocation.create({ data: { tenantId, name: 'Secondary' } })
    const payloadReceive = {
      tenantId,
      transactionNumber: 'RCPT-E2E-02',
      lines: [{ itemId, stockLocationId: dest.id, qty: 5, unitCost: 5 }]
    }
    const res2 = await retryRequest(() => request(app.getHttpServer()).post('/api/inventory/receive').set('Authorization', `Bearer ${authToken}`).send(payloadReceive), 3, 300)
    if (res2.status !== 201) console.error('Inventory receive (for transfer) failed after retries:', res2.status, res2.body)
    expect(res2.status).toBe(201)

    // transfer 3 from dest to main
    const payloadTransfer = {
      tenantId,
      transactionNumber: 'TRANS-E2E-01',
      fromLocationId: dest.id,
      toLocationId: locationId,
      lines: [{ itemId, qty: 3 }]
    }

    await request(app.getHttpServer()).post('/api/inventory/transfer').set('Authorization', `Bearer ${authToken}`).send(payloadTransfer).expect(201)

    const slMain = await prisma.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId: locationId } } })
    const slDest = await prisma.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId: dest.id } } })
    expect(slMain).toBeTruthy()
    expect(slDest).toBeTruthy()
    if (!slMain || !slDest) throw new Error('Stock level missing')
    expect(slMain.quantity.toNumber()).toBe(13) // 10 left + 3 transferred
    expect(slDest.quantity.toNumber()).toBe(2) // 5 received - 3 transferred
  })
})
