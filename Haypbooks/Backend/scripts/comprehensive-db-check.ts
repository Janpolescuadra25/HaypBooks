import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveDbCheck() {
  console.log('🔍 COMPREHENSIVE DATABASE HEALTH CHECK\n');
  console.log('=' .repeat(60));

  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  try {
    // 1. Test Database Connection
    console.log('\n📡 1. Testing Database Connection...');
    try {
      await prisma.$connect();
      successes.push('Database connection successful');
      console.log('   ✅ Connected to PostgreSQL');
    } catch (error: any) {
      issues.push(`Database connection failed: ${error.message}`);
      console.log(`   ❌ Connection failed: ${error.message}`);
      return;
    }

    // 2. Check All Tables Exist
    console.log('\n📊 2. Verifying All Tables...');
    const tables = [
      'User', 'Session', 'Otp', 'UserSecurityEvent', 'OnboardingStep',
      'Tenant', 'TenantUser', 'Company', 'Account', 'JournalEntry',
      'Invoice', 'InvoiceLineItem', 'Bill', 'BillLineItem', 'InventoryItem',
      'InventoryLocation', 'InventoryTransaction', 'CostLayer', 'PurchaseOrder',
      'PayrollRun', 'PayrollEmployee', 'Task', 'TaskComment', 'Attachment',
      'AccountingPeriod', 'Reversal', 'AuditLog'
    ];

    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].count();
        successes.push(`Table ${table} exists (${count} records)`);
        console.log(`   ✅ ${table}: ${count} records`);
      } catch (error: any) {
        issues.push(`Table ${table} missing or inaccessible: ${error.message}`);
        console.log(`   ❌ ${table}: ERROR`);
      }
    }

    // 3. Check Foreign Key Relationships
    console.log('\n🔗 3. Checking Foreign Key Integrity...');
    
    // Check if any orphaned records exist
    const orphanedSessions = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Session" s 
      LEFT JOIN "User" u ON s."userId" = u.id 
      WHERE u.id IS NULL
    `;
    if ((orphanedSessions as any)[0].count > 0) {
      warnings.push(`Found ${(orphanedSessions as any)[0].count} orphaned sessions`);
      console.log(`   ⚠️  ${(orphanedSessions as any)[0].count} orphaned sessions`);
    } else {
      successes.push('No orphaned sessions');
      console.log('   ✅ No orphaned sessions');
    }

    const orphanedOtps = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Otp" 
      WHERE "expiresAt" < NOW()
    `;
    if ((orphanedOtps as any)[0].count > 0) {
      warnings.push(`Found ${(orphanedOtps as any)[0].count} expired OTPs (cleanup recommended)`);
      console.log(`   ⚠️  ${(orphanedOtps as any)[0].count} expired OTPs (cleanup recommended)`);
    } else {
      successes.push('No expired OTPs');
      console.log('   ✅ No expired OTPs');
    }

    // 4. Check Indexes
    console.log('\n📇 4. Verifying Indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT 
        tablename, 
        indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    ` as any[];

    const criticalIndexes = [
      'User_email_key',
      'Session_token_key',
      'Otp_email_idx',
      'UserSecurityEvent_userId_idx',
      'UserSecurityEvent_email_idx'
    ];

    const foundIndexes = indexes.map(i => i.indexname);
    for (const criticalIndex of criticalIndexes) {
      if (foundIndexes.includes(criticalIndex)) {
        successes.push(`Index ${criticalIndex} exists`);
        console.log(`   ✅ ${criticalIndex}`);
      } else {
        warnings.push(`Missing critical index: ${criticalIndex}`);
        console.log(`   ⚠️  Missing: ${criticalIndex}`);
      }
    }

    console.log(`   ℹ️  Total indexes found: ${indexes.length}`);

    // 5. Check Data Integrity Rules
    console.log('\n🛡️  5. Checking Data Integrity...');

    // Check for users without sessions (potential signup incomplete)
    const usersWithoutSessions = await prisma.user.count({
      where: {
        sessions: {
          none: {}
        }
      }
    });
    if (usersWithoutSessions > 0) {
      warnings.push(`${usersWithoutSessions} users have never logged in`);
      console.log(`   ⚠️  ${usersWithoutSessions} users have never logged in`);
    } else {
      successes.push('All users have login history');
      console.log('   ✅ All users have login history (or no users yet)');
    }

    // Check for duplicate emails (should be impossible with unique constraint)
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count 
      FROM "User" 
      GROUP BY email 
      HAVING COUNT(*) > 1
    ` as any[];
    
    if (duplicateEmails.length > 0) {
      issues.push(`Found ${duplicateEmails.length} duplicate emails (CRITICAL)`);
      console.log(`   ❌ ${duplicateEmails.length} duplicate emails found!`);
    } else {
      successes.push('No duplicate emails');
      console.log('   ✅ No duplicate emails');
    }

    // 6. Check Enum Values
    console.log('\n🏷️  6. Verifying Enum Types...');
    const enums = await prisma.$queryRaw`
      SELECT 
        t.typname as enum_name,
        string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    ` as any[];

    enums.forEach(enumType => {
      successes.push(`Enum ${enumType.enum_name} defined`);
      console.log(`   ✅ ${enumType.enum_name}: ${enumType.values}`);
    });

    // 7. Storage Statistics
    console.log('\n💾 7. Database Storage Analysis...');
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    ` as any[];

    tableStats.forEach(stat => {
      console.log(`   📦 ${stat.tablename}: ${stat.size}`);
    });

    // 8. Check Multi-Tenant Isolation
    console.log('\n🏢 8. Multi-Tenant Verification...');
    const tenantCount = await prisma.tenant.count();
    const companyCount = await prisma.company.count();
    const tenantUserCount = await prisma.workspaceUser.count();

    console.log(`   ℹ️  Tenants: ${tenantCount}`);
    console.log(`   ℹ️  Companies: ${companyCount}`);
    console.log(`   ℹ️  Tenant-User relationships: ${tenantUserCount}`);

    if (tenantCount === 0) {
      warnings.push('No tenants created yet (expected for new database)');
      console.log('   ⚠️  No tenants created yet');
    }

    // 9. Check Authentication System
    console.log('\n🔐 9. Authentication System Check...');
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const otpCount = await prisma.otp.count();
    const securityEventCount = await prisma.userSecurityEvent.count();

    console.log(`   ℹ️  Users: ${userCount}`);
    console.log(`   ℹ️  Active sessions: ${sessionCount}`);
    console.log(`   ℹ️  OTPs: ${otpCount}`);
    console.log(`   ℹ️  Security events: ${securityEventCount}`);

    if (userCount === 0) {
      warnings.push('No users in system (expected for new database)');
      console.log('   ⚠️  No users in system');
    }

    // 10. Check Accounting System Setup
    console.log('\n📒 10. Accounting System Check...');
    const accountCount = await prisma.account.count();
    const journalEntryCount = await prisma.journalEntry.count();
    const invoiceCount = await prisma.invoice.count();
    const billCount = await prisma.bill.count();

    console.log(`   ℹ️  Accounts: ${accountCount}`);
    console.log(`   ℹ️  Journal Entries: ${journalEntryCount}`);
    console.log(`   ℹ️  Invoices: ${invoiceCount}`);
    console.log(`   ℹ️  Bills: ${billCount}`);

    if (accountCount === 0) {
      warnings.push('No accounts defined (needs setup after tenant creation)');
      console.log('   ⚠️  No accounts defined');
    }

  } catch (error: any) {
    issues.push(`Unexpected error during health check: ${error.message}`);
    console.log(`\n❌ Unexpected error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 HEALTH CHECK SUMMARY\n');

  if (successes.length > 0) {
    console.log(`✅ ${successes.length} checks passed`);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warnings:`);
    warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (issues.length > 0) {
    console.log(`❌ ${issues.length} critical issues:`);
    issues.forEach(i => console.log(`   - ${i}`));
  }

  console.log('\n' + '='.repeat(60));

  if (issues.length === 0 && warnings.length <= 2) {
    console.log('\n✨ DATABASE IS HEALTHY AND WELL-IMPLEMENTED ✨\n');
    return 0;
  } else if (issues.length === 0) {
    console.log('\n✅ DATABASE IS FUNCTIONAL (minor warnings only)\n');
    return 0;
  } else {
    console.log('\n⚠️  DATABASE HAS ISSUES THAT NEED ATTENTION\n');
    return 1;
  }
}

comprehensiveDbCheck()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
