const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')
const prisma = new PrismaClient()

function isUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

async function main() {
  console.log('Inspecting Tenant.id values for UUID compliance...')
  // Compatibility: Tenant model is now named Workspace in Prisma schema (mapped to "Tenant" table).
  // Use the Workspace model to inspect the Tenant.id values.
  const tenants = await prisma.workspace.findMany({ select: { id: true }, take: 10000 })
  const invalid = tenants.filter(t => !isUuid(t.id))
  if (invalid.length > 0) {
    console.warn(`Found ${invalid.length} Tenant.id values that are NOT valid UUIDs. Manual remediation required.`)
    console.warn('Examples:', invalid.slice(0, 5).map(t => t.id))
    console.warn('\nAborting automatic migration generation. Please inspect invalid ids, or delete/transform them before proceeding.')
    await prisma.$disconnect()
    process.exit(2)
  }

  console.log('All Tenant.id values look like UUIDs. Generating recommended migration SQL (preview).')

  const sql = `-- Recommended migration: convert Tenant.id text -> uuid
BEGIN;
-- Note: this operation may require exclusive access and careful verification in production
ALTER TABLE public."Tenant" ALTER COLUMN id TYPE uuid USING id::uuid;
-- If your DB has explicit FK constraints referencing Tenant.id that are mis-typed, you may need to ALTER CONSTRAINTS accordingly.
COMMIT;
`;

  console.log('\n--- BEGIN MIGRATION SQL ---')
  console.log(sql)
  console.log('--- END MIGRATION SQL ---')

  // Write to a file for operator convenience
  const outPath = './scripts/db/migration-sql/convert-tenant-id-to-uuid.sql'
  try {
    // Use cross-platform mkdir
    require('fs').mkdirSync('scripts/db/migration-sql', { recursive: true })
    require('fs').writeFileSync(outPath, sql)
    console.log('Wrote migration SQL to', outPath)
  } catch (e) {
    console.warn('Could not write migration file locally:', e && e.message)
  }

  console.log('\nIMPORTANT: Review the migration SQL, take backups, and run in a maintenance window. This script only validates UUID formatting and generates a suggested SQL migration; it does not modify the DB by itself.')

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })