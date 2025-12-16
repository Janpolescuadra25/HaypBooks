import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Contacts e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    // Use test DB for e2e
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

    // Ensure DB exists and run migrations then seed. Retry a few times to mitigate transient DB connection resets.
    const maxAttempts = 3
    let attempt = 0
    while (attempt < maxAttempts) {
      try {
        execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })
        break
      } catch (e) {
        attempt++
        if (attempt >= maxAttempts) throw e
        // small backoff
        await new Promise(r => setTimeout(r, 500))
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('creates contact & contact details with auto-generated IDs', async () => {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
    expect(tenant).toBeTruthy()

    // Create a contact
    const contact = await prisma.contact.create({ data: { tenantId: tenant!.id, type: 'CUSTOMER', displayName: 'E2E Contact Test' } })
    expect(contact).toBeTruthy()
    expect(contact.id).toBeTruthy()
    expect(contact.id.length).toBeGreaterThan(8)

    // Create email and phone using returned contact id
    const email = await prisma.contactEmail.create({ data: { contactId: contact.id, email: `e2e-${Date.now()}@haypbooks.test`, type: 'WORK', isPrimary: true } })
    const phone = await prisma.contactPhone.create({ data: { contactId: contact.id, phone: '555-1212', type: 'WORK', isPrimary: false } })

    expect(email.contactId).toBe(contact.id)
    expect(phone.contactId).toBe(contact.id)

    const loaded = await prisma.contact.findUnique({ where: { id: contact.id }, include: { contactEmails: true, contactPhones: true } })
    expect(loaded!.contactEmails.length).toBeGreaterThan(0)
    expect(loaded!.contactPhones.length).toBeGreaterThan(0)
  }, 20000)
})
