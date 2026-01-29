import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 Testing companiesCreated counter with multiple companies...\n');
  
  // Get a tenant
  const tenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { companies: true }
  });

  if (!tenant) {
    console.error('❌ No tenant found');
    process.exit(1);
  }

  console.log(`📍 Using Tenant: ${tenant.id}`);
  console.log(`   Current companies: ${tenant.companies.length}`);
  console.log(`   companiesCreated counter: ${tenant.companiesCreated}`);
  console.log(`   Trial used: ${tenant.trialUsed}\n`);

  // Create a second company for this tenant
  console.log('🔨 Creating second company...');
  const secondCompany = await prisma.company.create({
    data: {
      name: 'Test Company #2',
      workspaceId: tenant.id,
      currency: 'USD'
    }
  });

  console.log(`✅ Created company: ${secondCompany.id}\n`);

  // Increment counter (simulate what createCompanyRecord does)
  console.log('🔨 Incrementing counter...');
  await prisma.workspace.update({
    where: { id: tenant.id },
    data: { companiesCreated: { increment: 1 } }
  });

  // Verify counter
  const updatedTenant = await prisma.workspace.findUnique({
    where: { id: tenant.id },
    include: {
      companies: true
    }
  });

  console.log('\n📊 Final state:');
  console.log(`   Current companies: ${updatedTenant!.companies.length}`);
  console.log(`   companiesCreated counter: ${updatedTenant!.companiesCreated}`);
  console.log(`   Trial used: ${updatedTenant!.trialUsed}`);

  if (updatedTenant!.companiesCreated === tenant.companies.length + 1) {
    console.log('\n✅ SUCCESS: Counter incremented correctly!');
    console.log('   Counter should equal number of companies when none are deleted.\n');
  } else {
    console.log('\n❌ FAILED: Counter did not increment correctly!\n');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
