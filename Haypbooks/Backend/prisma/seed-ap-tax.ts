import * as dotenv from 'dotenv'
const prisma = require('../scripts/db/prisma-client-compat')

dotenv.config({ path: process.cwd() + '/.env' })

async function main() {
  console.log('Seeding AP & Tax sample data...')

  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo-haypbooks' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Tenant',
      subdomain: 'demo-haypbooks',
      baseCurrency: 'USD',
    },
  })

  // Create a vendor contact
  let vendorContact = await prisma.contact.findFirst({ where: { tenantId: tenant.id, displayName: 'Demo Vendor LLC' } })
  if (!vendorContact) {
    vendorContact = await prisma.contact.create({ data: { tenantId: tenant.id, type: 'VENDOR', displayName: 'Demo Vendor LLC' } })
  }

  const vendor = await prisma.vendor.upsert({
    where: { contactId: vendorContact.id },
    update: {},
    create: {
      contactId: vendorContact.id,
      tenantId: tenant.id,
    },
  })

  // Create a GL account to map tax to
  const taxAccount = await prisma.account.upsert({
    where: { code_tenantId: { tenantId: tenant.id, code: '2100' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: '2100',
      name: 'Sales Tax Payable',
      typeId: 2,
    },
  })

  // Create a tax jurisdiction and rate
  const jurisdiction = await prisma.taxJurisdiction.create({ data: { name: 'New York', country: 'US', region: 'NY', code: 'NY' } })
  const rate = await prisma.taxRate.create({ data: { jurisdictionId: jurisdiction.id, name: 'NY State Sales Tax', rate: 0.08875, effectiveFrom: new Date('2020-01-01') } })

  // Create a tenant-level TaxCode and map to account
  const taxCode = await prisma.taxCode.create({ data: { tenantId: tenant.id, code: 'NY_SALES', name: 'NY Sales Tax' } })
  await prisma.taxCodeRate.create({ data: { taxCodeId: taxCode.id, taxRateId: rate.id, sequence: 1, ratePct: 0.08875 } })
  await prisma.taxCodeAccount.create({ data: { tenantId: tenant.id, taxCodeId: taxCode.id, accountId: taxAccount.id } })

  // Create a bill with a single line
  const bill = await prisma.bill.create({ data: { tenantId: tenant.id, vendorId: vendor.contactId, billNumber: 'BILL-1000', total: 110.00, balance: 110.00, issuedAt: new Date() } })
  const billLine = await prisma.billLine.create({ data: { billId: bill.id, description: 'Service Charge', quantity: 1, rate: 100.00, amount: 100.00 } })
  await prisma.lineTax.create({ data: { tenantId: tenant.id, billLineId: billLine.id, taxCodeId: taxCode.id, taxRateId: rate.id, amount: 8.875 } })

  console.log('AP & Tax seed complete')
}

main()
  .catch(async (e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); })

