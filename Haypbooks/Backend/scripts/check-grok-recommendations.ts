import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking Database State vs Grok Recommendations ===\n');

  // Check Tenant table columns
  const tenantColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
    ORDER BY ordinal_position;
  `;

  console.log('📊 Tenant table columns:');
  console.table(tenantColumns);

  // Check User table columns
  const userColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
    ORDER BY ordinal_position;
  `;

  console.log('\n👤 User table columns:');
  console.table(userColumns);

  // Check Company table columns
  const companyColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Company'
    ORDER BY ordinal_position;
  `;

  console.log('\n🏢 Company table columns:');
  console.table(companyColumns);

  // Check TenantUser table
  const tenantUserColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TenantUser'
    ORDER BY ordinal_position;
  `;

  console.log('\n🔗 TenantUser table columns:');
  console.table(tenantUserColumns);

  console.log('\n\n=== Analysis vs Grok.7 Recommendations ===\n');
  
  // Check if recommendations are implemented
  const hasTenantName = tenantColumns.some(col => col.column_name === 'name');
  const hasUserFirmName = userColumns.some(col => col.column_name === 'firmname');
  const hasTenantFirmName = tenantColumns.some(col => col.column_name === 'firmName');
  const hasTrialStartsAt = tenantColumns.some(col => col.column_name === 'trialStartsAt');
  const hasTenantUsername = tenantColumns.some(col => col.column_name === 'username');

  console.log('✓ = Implemented | ✗ = Missing | ⚠ = Needs review\n');
  console.log(`${hasTenantName ? '✓' : '✗'} Tenant.name (client/account display name)`);
  console.log(`${hasUserFirmName ? '✓' : '✗'} User.firmName (accountant firm name)`);
  console.log(`${hasTenantFirmName ? '⚠' : '✓'} Tenant.firmName should be removed (use User.firmName instead)`);
  console.log(`${hasTrialStartsAt ? '✓' : '✗'} Tenant.trialStartsAt (trial period tracking)`);
  console.log(`${hasTenantUsername ? '⚠' : '✓'} Tenant.username (should use User.email instead)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
