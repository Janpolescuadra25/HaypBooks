import { PrismaClient } from '@prisma/client'

// Minimal CLI parsing to avoid extra dependencies
const argv = process.argv.slice(2)
const flags: Record<string, string | boolean> = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--dry-run') flags['dry-run'] = true
  else if (a === '--no-dry-run') flags['dry-run'] = false
  else if (a === '--limit') flags['limit'] = argv[i + 1] || '0'
}

const prisma = new PrismaClient()

async function main() {
  const dryRun = flags['dry-run'] !== undefined ? Boolean(flags['dry-run']) : true
  const limit = flags['limit'] ? Number(flags['limit']) : Infinity

  console.info('[CLEANUP] Starting duplicate companies cleanup', { dryRun, limit })

  // Fetch companies (we'll consider both active and inactive to diagnose duplicates fully)
  const companies = await prisma.company.findMany({ select: { id: true, name: true, tenantId: true, createdAt: true, isActive: true } })

  // Group by tenantId + normalized(name)
  const groups: Record<string, Array<any>> = {}
  for (const c of companies) {
    const key = `${c.tenantId}::${(c.name || '').trim().toLowerCase()}`
    groups[key] = groups[key] || []
    groups[key].push(c)
  }

  const duplicates = Object.entries(groups).filter(([, list]) => list.length > 1)
  console.info('[CLEANUP] Found duplicate groups', { duplicateGroups: duplicates.length })

  let processed = 0
  for (const [key, list] of duplicates) {
    if (processed >= limit) break
    processed++

    // Choose primary company: earliest createdAt (oldest)
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const primary = list[0]
    const others = list.slice(1)

    console.info('[CLEANUP] Candidate group', { key, primaryId: primary.id, count: list.length })
    for (const o of others) {
      console.info('[CLEANUP] -> duplicate candidate', { id: o.id, name: o.name, tenantId: o.tenantId })
    }

    if (dryRun) continue

    // Perform safe action: mark duplicates inactive and append note to name
    const tx: any[] = []
    for (const o of others) {
      tx.push(prisma.company.update({ where: { id: o.id }, data: { isActive: false, name: `${o.name} (duplicate of ${primary.id})` } }))
    }

    try {
      // prisma.$transaction expects PrismaPromises; the array we're passing is acceptable at runtime
      await prisma.$transaction(tx as any)
      console.info('[CLEANUP] ✅ Group cleaned (marked duplicates inactive)', { key, primaryId: primary.id, disabled: others.map((o) => o.id) })
    } catch (e) {
      console.error('[CLEANUP] ❌ Failed to apply transactional updates for group', { key, err: e?.message || e })
    }
  }

  console.info('[CLEANUP] Completed cleanup', { processed })
}

main().catch((e) => {
  console.error('[CLEANUP] Fatal error', e)
}).finally(async () => {
  await prisma.$disconnect()
})
