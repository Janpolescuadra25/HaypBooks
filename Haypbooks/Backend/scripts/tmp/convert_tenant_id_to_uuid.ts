import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
;(async()=>{
  try {
    console.log('Checking for non-UUID-like Tenant ids...')
    const bad: any = await prisma.$queryRawUnsafe("SELECT id FROM public.\"Tenant\" WHERE id !~ '^[0-9a-fA-F\\-]{36}$' LIMIT 10")
    if (bad && bad.length) {
      console.log('Found non-UUID-like Tenant ids (sample):', bad)
      console.log('Aborting conversion until manual review.')
      process.exit(1)
    }

    console.log('Running ALTER TABLE to convert Tenant.id to uuid...')
    await prisma.$executeRawUnsafe('BEGIN')
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE public."Tenant" ALTER COLUMN id TYPE uuid USING id::uuid')
      await prisma.$executeRawUnsafe('COMMIT')
      console.log('✅ Tenant.id converted to uuid')
    } catch (e) {
      await prisma.$executeRawUnsafe('ROLLBACK')
      console.error('❌ ALTER failed:', e?.message || e)
      process.exit(1)
    }
  } catch (e) {
    console.error('Error checking/converting Tenant.id:', e?.message || e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
