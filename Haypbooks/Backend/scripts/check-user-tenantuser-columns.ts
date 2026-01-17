import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking User and TenantUser table columns ===\n');

  // Query User table columns
  const userColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
    ORDER BY ordinal_position;
  `;

  console.log('User table columns:');
  console.table(userColumns);

  // Query TenantUser table columns
  const tenantUserColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TenantUser'
    ORDER BY ordinal_position;
  `;

  console.log('\nTenantUser table columns:');
  console.table(tenantUserColumns);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
