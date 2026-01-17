import { PrismaClient } from '@prisma/client'

async function run() {
  const prisma = new PrismaClient()
  try {
    console.log('Finding companies with null name...')
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT id FROM public."Company" WHERE name IS NULL')
    if (!rows || rows.length === 0) {
      console.log('No companies with null name found.')
      return
    }

    console.log(`Found ${rows.length} companies with null name. Backfilling...`)
    let updated = 0
    for (const r of rows) {
      const id = r.id || r[0]
      const newName = `Unnamed Company ${String(id).slice(0,8)}`
      await prisma.company.update({ where: { id }, data: { name: newName } })
      console.log(`Updated company ${id} -> ${newName}`)
      updated++
    }

    console.log(`Backfill complete. Updated: ${updated}`)
  } catch (e) {
    console.error('Backfill failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) run().catch(e => { console.error(e); process.exit(1) })
