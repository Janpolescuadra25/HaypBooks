import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
;(async()=>{
  try {
    const rows: any = await prisma.$queryRawUnsafe("SELECT conname, conrelid::regclass::text AS table_name FROM pg_constraint WHERE pg_get_constraintdef(oid) LIKE '%tenantId_old%';")
    if (!rows || rows.length === 0) return console.log('No tenantId_old constraints found')
    console.log('Found constraints:', rows.map((r:any)=>r.conname))
    for (const r of rows) {
      const con = String(r.conname)
      let tbl = String(r.table_name)
      tbl = tbl.replace(/"/g, '')
      console.log('Dropping constraint', con, 'on table', tbl)
      try {
        // Run individually and continue on errors (best-effort cleanup)
        await prisma.$executeRawUnsafe(`ALTER TABLE public."${tbl}" DROP CONSTRAINT IF EXISTS "${con}"`)
      } catch (e:any) {
        console.error('Failed to drop', con, e?.message || e)
      }
    }
    console.log('Attempted to drop tenantId_old constraints (best-effort)')
  } catch (e:any) {
    console.error('drop error', e?.message || e)
    try { await prisma.$executeRawUnsafe('ROLLBACK') } catch(e){}
    process.exit(1)
  } finally { await prisma.$disconnect() }
})()
