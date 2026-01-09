const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const cols = [
      'businessType','industry','startDate','country','address','taxId','vatRegistered','vatRate','pricesInclusive','taxFilingFrequency','taxExempt','logoUrl','invoicePrefix','defaultPaymentTerms','accountingMethod'
    ]
    const res = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Tenant' AND column_name = ANY($1)`, cols)
    if (!res || res.length === 0) {
      console.log('✅ No deprecated onboarding columns found on Tenant (verified via Prisma).')
      process.exit(0)
    }
    console.error('❌ Found deprecated columns on Tenant:')
    for (const r of res) console.error('  -', r.column_name || r.column_name)
    process.exit(2)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(2) })