import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Comprehensive Database State Analysis ===\n');

  // 1. Check User table structure
  const userColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
    ORDER BY ordinal_position;
  `;

  // 2. Check Tenant table structure
  const tenantColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Tenant'
    ORDER BY ordinal_position;
  `;

  // 3. Check Company table structure
  const companyColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Company'
    ORDER BY ordinal_position;
  `;

  // 4. Check indexes for performance
  const tenantIndexes = await prisma.$queryRaw<any[]>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'Tenant'
    ORDER BY indexname;
  `;

  const companyIndexes = await prisma.$queryRaw<any[]>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'Company'
    ORDER BY indexname;
  `;

  console.log('✅ IMPLEMENTED FIELDS:\n');
  
  const hasTenantName = tenantColumns.some(col => col.column_name === 'name');
  const hasUserFirmName = userColumns.some(col => col.column_name === 'firmname');
  const hasTenantFirmName = tenantColumns.some(col => col.column_name === 'firmName');
  const hasTrialStartsAt = tenantColumns.some(col => col.column_name === 'trialStartsAt');
  const hasTrialEndsAt = tenantColumns.some(col => col.column_name === 'trialEndsAt');
  const hasCompanySubscription = companyColumns.some(col => col.column_name === 'subscriptionId');
  
  console.log(`  ✓ Tenant.name (client display): ${hasTenantName ? 'YES' : 'NO'}`);
  console.log(`  ✓ User.firmName (accountant firm): ${hasUserFirmName ? 'YES' : 'NO'}`);
  console.log(`  ✓ Tenant.firmName (legacy): ${hasTenantFirmName ? 'YES' : 'NO'}`);
  console.log(`  ✓ Tenant.trialStartsAt: ${hasTrialStartsAt ? 'YES' : 'NO'}`);
  console.log(`  ✓ Tenant.trialEndsAt: ${hasTrialEndsAt ? 'YES' : 'NO'}`);
  console.log(`  ✓ Company.subscriptionId: ${hasCompanySubscription ? 'YES' : 'NO'}`);

  console.log('\n📊 PERFORMANCE INDEXES:\n');
  console.log('Tenant table indexes:');
  tenantIndexes.forEach(idx => {
    console.log(`  - ${idx.indexname}`);
  });
  
  console.log('\nCompany table indexes:');
  companyIndexes.forEach(idx => {
    console.log(`  - ${idx.indexname}`);
  });

  // Check for data that needs migration
  console.log('\n🔍 DATA MIGRATION CHECKS:\n');

  // Check if any tenants have firmName but users don't
  const tenantsWithFirmName = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM "Tenant" WHERE "firmName" IS NOT NULL;
  `;
  
  // Check accountant users
  const accountantUsers = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM "User" WHERE "isAccountant" = true;
  `;

  // Check users with firmname populated
  const usersWithFirmName = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM "User" WHERE "firmname" IS NOT NULL;
  `;

  console.log(`  Tenants with firmName: ${tenantsWithFirmName[0]?.count || 0}`);
  console.log(`  Accountant users: ${accountantUsers[0]?.count || 0}`);
  console.log(`  Users with firmName populated: ${usersWithFirmName[0]?.count || 0}`);

  // Check for missing indexes on high-traffic queries
  console.log('\n⚡ RECOMMENDED NEXT STEPS:\n');

  const recommendations = [];

  // 1. If Tenant.firmName has data but User.firmName is empty
  if (tenantsWithFirmName[0]?.count > 0 && usersWithFirmName[0]?.count === 0) {
    recommendations.push('1. Migrate Tenant.firmName → User.firmName for accountants');
  }

  // 2. Check for indexes on common queries
  const hasCompanyTenantIndex = companyIndexes.some(idx => 
    idx.indexdef.includes('tenantId')
  );
  if (!hasCompanyTenantIndex) {
    recommendations.push('2. Add index on Company(tenantId) for faster tenant queries');
  }

  // 3. Check if Tenant has name index for accountant dashboards
  const hasTenantNameIndex = tenantIndexes.some(idx => 
    idx.indexdef.includes('name')
  );
  if (hasTenantName && !hasTenantNameIndex) {
    recommendations.push('3. Add index on Tenant(name) for faster client searches');
  }

  // 4. Check for composite indexes on common queries
  const hasCompanyActiveIndex = companyIndexes.some(idx => 
    idx.indexdef.includes('isActive')
  );
  if (!hasCompanyActiveIndex) {
    recommendations.push('4. Add index on Company(tenantId, isActive) for active company queries');
  }

  if (recommendations.length === 0) {
    console.log('  🎉 All major optimizations implemented! Schema is in great shape.');
  } else {
    recommendations.forEach(rec => console.log(`  ${rec}`));
  }

  console.log('\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
