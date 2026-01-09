const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  try {
    console.log('Applying idempotent ALTER TABLE to add onboarding columns to Tenant')
    const stmts = [
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "businessType" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "industry" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "startDate" timestamptz`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "fiscalStart" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'PH'`,

      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "address" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxId" varchar(50)`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRegistered" boolean DEFAULT true`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "vatRate" numeric(5,2)`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "pricesInclusive" boolean DEFAULT true`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxFilingFrequency" text DEFAULT 'QUARTERLY'`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "taxExempt" boolean DEFAULT false`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "logoUrl" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "invoicePrefix" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "defaultPaymentTerms" text`,
      `ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS "accountingMethod" text DEFAULT 'ACCRUAL'`
    ]

    for (const s of stmts) {
      try {
        console.log('Executing:', s.slice(0, 80) + '...')
        await prisma.$executeRawUnsafe(s)
      } catch (e) {
        console.error('Failed to execute statement:', e?.message || e)
      }
    }

    console.log('Done applying onboarding columns')
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
