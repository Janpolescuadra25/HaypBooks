import * as dotenv from 'dotenv'
const prisma = require('../scripts/db/prisma-client-compat')

dotenv.config({ path: process.cwd() + '/.env' })

async function main() {
  console.log('Seeding AP & Tax sample data...')

  const ownerUserId = '00000000-0000-0000-0000-000000000002'
  const workspaceId = '00000000-0000-0000-0000-000000000001'
  const companyId = '00000000-0000-0000-0000-000000000003'

  const ownerUser = await prisma.user.upsert({
    where: { email: 'demo-owner@haypbooks.local' },
    update: {},
    create: {
      id: ownerUserId,
      email: 'demo-owner@haypbooks.local',
      password: 'ChangeMe123!',
      isEmailVerified: true,
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: {},
    create: {
      id: workspaceId,
      ownerUserId: ownerUser.id,
      baseCurrency: 'USD',
    },
  })

  const company = await prisma.company.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: 'Demo Company' } },
    update: {},
    create: {
      id: companyId,
      workspaceId: workspace.id,
      name: 'Demo Company',
      legalName: 'Demo Company LLC',
      currency: 'USD',
    },
  })

  let vendorContact = await prisma.contact.findFirst({
    where: { workspaceId: workspace.id, displayName: 'Demo Vendor LLC' },
  })
  if (!vendorContact) {
    vendorContact = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        type: 'VENDOR',
        displayName: 'Demo Vendor LLC',
      },
    })
  }

  const vendor = await prisma.vendor.upsert({
    where: { contactId: vendorContact.id },
    update: {},
    create: {
      contactId: vendorContact.id,
      workspaceId: workspace.id,
    },
  })

  const taxAccount = await prisma.account.upsert({
    where: { companyId_code: { companyId: company.id, code: '2100' } },
    update: {},
    create: {
      companyId: company.id,
      code: '2100',
      name: 'Sales Tax Payable',
      typeId: 2,
    },
  })

  const country = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States',
      defaultCurrency: 'USD',
    },
  })

  const jurisdiction = await prisma.taxJurisdiction.upsert({
    where: { countryId_region_code: { countryId: country.id, region: 'NY', code: 'NY' } },
    update: {},
    create: {
      countryId: country.id,
      name: 'New York',
      region: 'NY',
      code: 'NY',
    },
  })

  let rate = await prisma.taxRate.findFirst({
    where: { companyId: company.id, jurisdictionId: jurisdiction.id, name: 'NY State Sales Tax' },
  })
  if (!rate) {
    rate = await prisma.taxRate.create({
      data: {
        companyId: company.id,
        jurisdictionId: jurisdiction.id,
        name: 'NY State Sales Tax',
        rate: 0.08875,
        effectiveFrom: new Date('2020-01-01'),
      },
    })
  }

  const taxCode = await prisma.taxCode.upsert({
    where: { companyId_code: { companyId: company.id, code: 'NY_SALES' } },
    update: { name: 'NY Sales Tax' },
    create: {
      companyId: company.id,
      code: 'NY_SALES',
      name: 'NY Sales Tax',
    },
  })
  const existingTaxCodeRate = await prisma.taxCodeRate.findFirst({
    where: { taxCodeId: taxCode.id, taxRateId: rate.id },
  })
  if (!existingTaxCodeRate) {
    await prisma.taxCodeRate.create({
      data: {
        companyId: company.id,
        taxCodeId: taxCode.id,
        taxRateId: rate.id,
        sequence: 1,
        ratePct: 0.08875,
      },
    })
  }
  await prisma.taxCodeAccount.upsert({
    where: { companyId_taxCodeId_accountId: { companyId: company.id, taxCodeId: taxCode.id, accountId: taxAccount.id } },
    update: {},
    create: {
      companyId: company.id,
      taxCodeId: taxCode.id,
      accountId: taxAccount.id,
    },
  })

  const bill = await prisma.bill.upsert({
    where: { companyId_vendorId_billNumber: { companyId: company.id, vendorId: vendor.contactId, billNumber: 'BILL-1000' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      companyId: company.id,
      vendorId: vendor.contactId,
      billNumber: 'BILL-1000',
      total: 110.0,
      balance: 110.0,
      issuedAt: new Date(),
    },
  })

  let billLine = await prisma.billLine.findFirst({ where: { billId: bill.id, description: 'Service Charge' } })
  if (!billLine) {
    billLine = await prisma.billLine.create({
      data: {
        billId: bill.id,
        workspaceId: workspace.id,
        companyId: company.id,
        description: 'Service Charge',
        quantity: 1,
        rate: 100.0,
        amount: 100.0,
      },
    })
  }

  const existingLineTax = await prisma.lineTax.findFirst({
    where: { billLineId: billLine.id, taxCodeId: taxCode.id },
  })
  if (!existingLineTax) {
    await prisma.lineTax.create({
      data: {
        companyId: company.id,
        billLineId: billLine.id,
        taxCodeId: taxCode.id,
        taxRateId: rate.id,
        amount: 8.875,
      },
    })
  }

  console.log('AP & Tax seed complete')
}

main()
  .catch(async (e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); })

