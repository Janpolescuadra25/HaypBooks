import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(){
  console.log('DB health checks')

  const cols = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type FROM information_schema.columns
    WHERE column_name IN ('deletedAt','fileName','uploadedById')
    ORDER BY table_name, column_name
  ` as any
  console.log('\nImportant columns:')
  for (const r of cols) console.log(`${r.table_name}.${r.column_name} -> ${r.data_type}`)

  const taskCols = await prisma.$queryRaw`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name='Task'
  ` as any
  console.log('\nTask columns:')
  for (const r of taskCols) console.log(`${r.column_name} -> ${r.data_type}`)

  const attachCols = await prisma.$queryRaw`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name='Attachment'
  ` as any
  console.log('\nAttachment columns:')
  for (const r of attachCols) console.log(`${r.column_name} -> ${r.data_type}`)

  const idxs = await prisma.$queryRaw`
    SELECT indexname, indexdef FROM pg_indexes WHERE tablename='Task'
  ` as any
  console.log('\nTask indexes:')
  for (const r of idxs) console.log(r.indexname)

  const tenantTypes = await prisma.$queryRaw`
    SELECT table_name, data_type FROM information_schema.columns
    WHERE column_name='tenantId' ORDER BY table_name
  ` as any
  console.log('\nTables with tenantId and types:')
  for (const r of tenantTypes) console.log(`${r.table_name} -> ${r.data_type}`)

  await prisma.$disconnect()
}

main().catch(e=>{ console.error(e); process.exit(1) })
