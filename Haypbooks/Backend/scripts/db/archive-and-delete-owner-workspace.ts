import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()

    // IDs identified earlier as owner-workspace rows in Company table
    const targetIds = [
      '9b1359bc-dfeb-4ff8-bfd5-30c59e0950d3',
      '9ecda157-8d82-4ac9-9753-9c0473fb931c'
    ]

    // Create audit table if missing
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public."OwnerWorkspaceCompanyAudit" (
        id UUID PRIMARY KEY,
        "tenantId" UUID,
        name TEXT,
        "isActive" BOOLEAN,
        "archivedAt" timestamptz DEFAULT now(),
        note TEXT
      )
    `)

    // Select the rows to archive using Prisma (avoids raw SQL typing issues)
    const rows = await prisma.company.findMany({ where: { id: { in: targetIds } }, select: { id: true, workspaceId: true, name: true, isActive: true } })

    if (!rows || rows.length === 0) {
      console.log('No matching companies found for the specified IDs. No changes made.')
      return
    }

    console.log('Archiving the following companies:')
    console.table(rows.map(r => ({ id: r.id, tenantId: r.tenantId, name: r.name, isActive: r.isActive })))

    // Archive into audit table using parameterized queries
    for (const r of rows) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO public."OwnerWorkspaceCompanyAudit" (id, "tenantId", name, "isActive", note) VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
        r.id, r.tenantId, r.name, r.isActive, 'Archived owner-workspace-as-company'
      )
    }

    // Delete the rows from Company (use prisma API)
    const del = await prisma.company.deleteMany({ where: { id: { in: targetIds } } })

    console.log(`Deleted ${del.count} company row(s).`)
    console.log('Archived rows are stored in public."OwnerWorkspaceCompanyAudit" for tracking.')

  } catch (e) {
    console.error('Error during archive/delete:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
