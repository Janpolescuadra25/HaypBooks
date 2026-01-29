const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const apply = process.env.APPLY === 'true'
  const rows = await prisma.$queryRawUnsafe(`SELECT id, "tenantId", name FROM public."Company" WHERE name IS NULL LIMIT 100`) || []
  if (!rows || rows.length === 0) {
    console.log('No companies with NULL name found.')
    await prisma.$disconnect()
    return
  }

  console.log(`Found ${rows.length} companies with NULL name. Example ids:`, rows.slice(0, 5).map(r => r.id))

  for (const r of rows) {
    // Try to derive a name from tenant workspace_name/name
    const tenant = await prisma.$queryRawUnsafe(`SELECT id, name, workspace_name FROM public."Tenant" WHERE id::text = '${r.tenantid}' LIMIT 1`)
    const t = tenant && tenant[0]
    let newName = null
    if (t) {
      const candidate = t.workspace_name || t.name
      if (candidate) newName = `${candidate} (recovered)`
    }
    if (!newName) newName = `Unnamed Company ${r.id}`

    console.log(`Would update company ${r.id} -> name: "${newName}"`)
    if (apply) {
      try {
        await prisma.company.update({ where: { id: r.id }, data: { name: newName } })
        console.log(`Updated ${r.id}`)
      } catch (e) {
        console.error(`Failed to update ${r.id}:`, e && e.message)
      }
    }
  }

  if (!apply) console.log('\nDry-run complete. Rerun with APPLY=true to apply changes.')

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })