import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Manually applying schema additions ===\n');

  try {
    // Only run Tenant column update if Tenant table exists
    const tenantExists = await prisma.$queryRawUnsafe(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Tenant'
    `);
    if (Array.isArray(tenantExists) && tenantExists.length > 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "name" TEXT;
      `);
      console.log('✓ Added Tenant.name column');
    } else {
      console.log('Tenant table does not exist; skipping Tenant.name migration.');
    }

    // Add firmname column to User table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firmname" TEXT;
    `);
    console.log('✓ Added User.firmname column');

    console.log('\n=== Verifying columns ===\n');

    // Verify Tenant columns
    const tenantColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Tenant'
      ORDER BY ordinal_position;
    `;
    
    const hasTenantName = tenantColumns.some(col => col.column_name === 'name');
    console.log(`Tenant.name: ${hasTenantName ? '✓ EXISTS' : '✗ MISSING'}`);

    // Verify User columns
    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    const hasUserFirmName = userColumns.some(col => col.column_name === 'firmname');
    console.log(`User.firmname: ${hasUserFirmName ? '✓ EXISTS' : '✗ MISSING'}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
