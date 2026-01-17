import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })
const prisma = new PrismaClient()

async function run() {
  console.log('Testing company->tenant trigger:')

  // Create two tenants
  const t1Id = require('crypto').randomUUID()
  await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","baseCurrency","createdAt","updatedAt") VALUES ($1::uuid,$2, now(), now())', t1Id, 'USD')
  const t1 = { id: t1Id }
  const t2Id = require('crypto').randomUUID()
  await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","baseCurrency","createdAt","updatedAt") VALUES ($1::uuid,$2, now(), now())', t2Id, 'USD')
  const t2 = { id: t2Id }

  const c1 = await prisma.company.create({ data: { id: `company-${t1.id}`, tenantId: t1.id, name: 'T1 Default' } })
  const c2 = await prisma.company.create({ data: { id: `company-${t2.id}`, tenantId: t2.id, name: 'T2 Default' } })

  // Make a contact/customer for tenant 1 so invoice insert reaches the trigger check
  const contact = await prisma.contact.create({ data: { id: `${t1.id}-contact`, tenantId: t1.id, type: 'CUSTOMER', displayName: 'T1 Customer' } })
  await prisma.customer.create({ data: { contactId: contact.id, tenantId: t1.id } })

  try {
    // attempt to create an invoice for tenant t1 but with company c2 (wrong tenant)
    await prisma.invoice.create({ data: { tenantId: t1.id, companyId: c2.id, customerId: contact.id, totalAmount: 10, balance: 10, date: new Date() } })
    console.error('Expected failure but insert succeeded (trigger not applied)')
  } catch (e) {
    console.log('Trigger prevented mismatched company assignment (expected):', (e as any).message || e)
  }
}

run()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(async () => { await prisma.$disconnect() })
