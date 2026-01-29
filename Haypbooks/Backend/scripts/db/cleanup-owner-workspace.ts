import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    // Detect which workspace column exists on Tenant (workspaceName or workspace_name)
    // Detect which tenant column likely contains the workspace display name (prefer 'name', then 'workspaceName' or 'workspace_name')
    const colsRes: Array<{ column_name: string }> = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns WHERE lower(table_name) = 'tenant' AND column_name IN ('name', 'workspaceName', 'workspace_name')
    ` as any

    if (!colsRes || colsRes.length === 0) {
      console.log('No candidate name/workspace column found on Tenant. Continuing with heuristic search only.')
    }

    // Prefer 'name' if it exists, otherwise pick first from list (may be undefined)
    let col = colsRes && colsRes.length ? (colsRes.find(c => c.column_name === 'name')?.column_name || colsRes[0].column_name) : null

    // Find companies where company.name equals tenant.[col] (case-insensitive, trimmed)
    const sql = `SELECT c.id, c."tenantId", c.name, t."${col}" as "tenantName", c."isActive" FROM public."Company" c JOIN public."Tenant" t ON c."tenantId" = t.id WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(COALESCE(t."${col}", '')))`
    let rows: any[] = []
    try {
      rows = await prisma.$queryRawUnsafe(sql)
    } catch (err) {
      // ignore if join query fails due to unexpected schema differences
      rows = []
    }

    // Also search for companies whose name contains 'owner workspace' text (heuristic)
    const heur: any[] = await prisma.$queryRawUnsafe(`SELECT id, "tenantId", name, "isActive" FROM public."Company" WHERE LOWER(name) LIKE '%owner workspace%';`)
    if (heur && heur.length) {
      // Append heuristics, avoiding duplicates
      const existing = new Set(rows.map(r => r.id))
      for (const h of heur) if (!existing.has(h.id)) rows.push(h)
    }



    if (!rows || rows.length === 0) {
      console.log('No candidate companies found where Company.name = Tenant.workspaceName')
      return
    }

    console.log(`Found ${rows.length} candidate company(ies) to review:`)
    console.table(rows.map(r => ({ id: r.id, tenantId: r.tenantId, name: r.name, workspaceName: r.workspaceName, isActive: r.isActive })))

    const apply = process.argv.includes('--apply')
    if (!apply) {
      console.log('\nPreview mode (no changes made). To deactivate these companies run with --apply')
      return
    }

    const ids = rows.map(r => r.id)
    const res = await prisma.company.updateMany({ where: { id: { in: ids } }, data: { isActive: false } })
    console.log(`\nDeactivated ${res.count} company(ies).`) 
    console.log('Note: This operation sets isActive=false. Review state and run additional cleanup if desired.')
  } catch (e) {
    console.error('Error running cleanup script:', e)
    process.exitCode = 1
  } finally {
    try { await prisma.$disconnect() } catch (e) {}
  }
}

main()
