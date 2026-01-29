const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Computing active project counts per workspace...')
    const rows = await prisma.$queryRaw`
      SELECT "tenantId" AS workspaceId, COUNT(*) AS cnt
      FROM "Project" WHERE "isActive" = true
      GROUP BY "tenantId"`;

    for (const r of rows) {
      const workspaceId = r.workspaceid || r.workspaceId
      const cnt = parseInt(r.cnt, 10) || 0
      try {
        await prisma.workspace.update({ where: { id: workspaceId }, data: { activeProjectCount: cnt } })
        console.log('Updated', workspaceId, cnt)
      } catch (err) {
        console.warn('Skipping update for missing workspace', workspaceId)
      }
    }

    // Set zero for workspaces that have none
    await prisma.$executeRaw`
      UPDATE "Tenant" w SET "active_project_count" = 0 WHERE w.id NOT IN (SELECT DISTINCT "tenantId" FROM "Project");`;

    console.log('Backfill complete.')
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
