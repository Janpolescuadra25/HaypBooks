import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTablesMatching(name: string) {
  const rows: Array<{ table_name: string }> = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name ILIKE ${name}
  `;
  return rows.map(r => r.table_name);
}

async function getColumns(table: string) {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name = ${table}
    ORDER BY ordinal_position
  `;
  return cols;
}

async function getForeignKeys(table: string) {
  const fks = await prisma.$queryRaw`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = ${table}
  `;
  return fks;
}

async function getTenantWorkspaceColumns() {
  const rows: any = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND (
      column_name ILIKE '%tenant%'
      OR column_name ILIKE '%workspace%'
    )
    ORDER BY table_name, column_name
  `;
  return rows;
}

async function main() {
  const targets = ['company', 'contact', 'accountingperiod', 'role', 'project'];
  const report: any = { tables: {} };

  for (const t of targets) {
    const matches = await getTablesMatching(t);
    for (const table of matches) {
      report.tables[table] = {
        columns: await getColumns(table),
        foreignKeys: await getForeignKeys(table),
      };
    }
  }

  report.tenantWorkspaceColumns = await getTenantWorkspaceColumns();

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
