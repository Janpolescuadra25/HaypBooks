const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const sql = fs.readFileSync(__dirname + '/../../prisma/migrations/20260110_remove_tenant_onboarding_fields/migration.sql', 'utf8')
    console.log('Applying SQL via Prisma...')
    for (const stmt of sql.split(/;\s*$/m)) {
      const s = stmt.trim()
      if (!s) continue
      console.log('Executing:', s.split('\n')[0].slice(0, 200))
      await prisma.$executeRawUnsafe(s)
    }
    console.log('Done.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(2) })