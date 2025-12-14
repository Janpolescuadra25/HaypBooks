import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verifying database structure...\n');

    // Check User table
    const userCount = await prisma.user.count();
    console.log(`✅ User table: ${userCount} records`);

    // Check Session table
    const sessionCount = await prisma.session.count();
    console.log(`✅ Session table: ${sessionCount} records`);

    // Check UserSecurityEvent table
    const securityEventCount = await prisma.userSecurityEvent.count();
    console.log(`✅ UserSecurityEvent table: ${securityEventCount} records`);

    // Check Tenant table
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Tenant table: ${tenantCount} records`);

    // Check Company table
    const companyCount = await prisma.company.count();
    console.log(`✅ Company table: ${companyCount} records`);

    // Check Task table (new)
    const taskCount = await prisma.task.count();
    console.log(`✅ Task table: ${taskCount} records`);

    // Check Attachment table (enhanced)
    const attachmentCount = await prisma.attachment.count();
    console.log(`✅ Attachment table: ${attachmentCount} records`);

    console.log('\n✅ Database structure verified successfully!');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
