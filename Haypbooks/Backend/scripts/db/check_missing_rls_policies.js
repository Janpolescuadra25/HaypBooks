const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const missing = await prisma.$queryRaw`
      SELECT DISTINCT c.table_name FROM information_schema.columns c
      WHERE c.column_name='tenantId' AND c.table_schema='public' AND c.table_name NOT IN (
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'tenant_isolation_%'
      ) ORDER BY c.table_name;`

    if (missing.length === 0) {
      console.log('✅ No missing tenant_isolation_* policies found.')
      process.exit(0)
    }

    console.error('⚠️ Missing tenant_isolation_* policies for the following tables:')
    missing.forEach(r => console.error(' -', r.table_name))
    process.exit(2)
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
