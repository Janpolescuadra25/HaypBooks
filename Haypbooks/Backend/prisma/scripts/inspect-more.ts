import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fetchInfo(table: string) {
  const cols = await prisma.$queryRaw`SELECT column_name, data_type, is_nullable, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name ILIKE ${table}` as any[]
  const fks = await prisma.$queryRaw`SELECT tc.constraint_name, kcu.column_name, ccu.table_name as foreign_table_name, ccu.column_name as foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name ILIKE ${table}` as any[]
  return { cols, fks }
}

async function main() {
  const tables = ['Customer','Invoice','AccountingPeriod','Role','Timesheet']
  const out: any = {}
  for (const t of tables) {
    out[t] = await fetchInfo(t)
  }
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e=>{ console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect())
