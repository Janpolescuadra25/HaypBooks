const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const policies = await prisma.$queryRaw`SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;`
    const tenantTables = await prisma.$queryRaw`SELECT table_name FROM information_schema.columns WHERE column_name='tenantId' AND table_schema='public' ORDER BY table_name;`
    const missingPolicies = await prisma.$queryRaw`
      SELECT DISTINCT c.table_name FROM information_schema.columns c
      WHERE c.column_name='tenantId' AND c.table_schema='public' AND c.table_name NOT IN (
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'tenant_isolation_%'
      ) ORDER BY c.table_name;`
    const rlsEnabled = await prisma.$queryRaw`
      SELECT c.relname AS table_name FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname='public' AND c.relrowsecurity = true ORDER BY c.relname;`
    const checkConstraints = await prisma.$queryRaw`
      SELECT tc.constraint_name, tc.table_name, cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.constraint_type='CHECK' AND (
        cc.check_clause ILIKE '%companyId%' OR cc.check_clause ILIKE '%practiceId%' OR
        tc.constraint_name ILIKE '%scope%' OR tc.constraint_name ILIKE '%xor%'
      )
      ORDER BY tc.table_name;`

    console.log(JSON.stringify({ policies, tenantTables, missingPolicies, rlsEnabled, checkConstraints }, null, 2))
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
