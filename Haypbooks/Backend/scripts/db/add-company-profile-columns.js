const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  try {
    console.log('Applying idempotent ALTER TABLE to add onboarding/profile columns to Company')
    const stmts = [
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "legalName" varchar(200)`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "businessType" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "industry" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "address" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "country" varchar(100)`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "startDate" timestamptz`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "taxId" varchar(50)`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "logoUrl" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "invoicePrefix" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "vatRegistered" boolean DEFAULT false`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "vatRate" numeric(5,2)`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "pricesInclusive" boolean DEFAULT false`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "defaultPaymentTerms" text`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "accountingMethod" text DEFAULT 'ACCRUAL'`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "inventoryEnabled" boolean DEFAULT false`,
      `ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "payrollEnabled" boolean DEFAULT false`
    ]

    for (const s of stmts) {
      try {
        console.log('Executing:', s.slice(0, 80) + '...')
        await prisma.$executeRawUnsafe(s)
      } catch (e) {
        console.error('Failed to execute statement:', e?.message || e)
      }
    }

    console.log('Done applying Company profile columns')
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
