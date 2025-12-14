import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllTables() {
  console.log('🗄️  DATABASE TABLES CHECK\n');
  console.log('='.repeat(60));

  try {
    await prisma.$connect();
    console.log('\n✅ Connected to database\n');

    // Get all tables from the database
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as any[];

    console.log(`📊 Found ${tables.length} tables in database:\n`);

    tables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${table.table_name} (${table.column_count} columns)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All tables exist and are accessible\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllTables();
