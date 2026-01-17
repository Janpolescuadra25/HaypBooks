import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      username: true,
      status: true,
      trialUsed: true,
      companiesCreated: true,
      createdAt: true,
      _count: {
        select: { companies: true }
      }
    }
  });

  console.log('\n📊 Latest 5 Tenants:');
  console.log('='.repeat(120));
  
  for (const tenant of tenants) {
    console.log(`\nTenant: ${tenant.id}`);
    console.log(`  Username: ${tenant.username || '(not set)'}`);
    console.log(`  Status: ${tenant.status}`);
    console.log(`  Trial Used: ${tenant.trialUsed}`);
    console.log(`  Companies Created (counter): ${tenant.companiesCreated}`);
    console.log(`  Companies Currently in DB: ${tenant._count.companies}`);
    console.log(`  Created: ${tenant.createdAt.toISOString()}`);
  }

  console.log('\n='.repeat(120));
  console.log(`\n✅ Counter verification: Each tenant should have companiesCreated >= current company count`);
  console.log(`   (Counter tracks historical total, including deleted companies)\n`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
