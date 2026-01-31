import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking Database State vs Grok Recommendations ===\n');

  // Check existence of recommended Grok tables and a few basic sanity checks
  const exists = async (tableName: string) => {
    const r = await prisma.$queryRaw<any[]>`
      SELECT to_regclass(${tableName::text}) IS NOT NULL AS exists
    `;
    return r && r[0] && (r[0].exists === true || r[0].exists === 't' || r[0].exists === 'true');
  };

  const tablesToCheck = ['FirmPlan', 'FirmPlanFeature', 'FirmFeatureFlag', 'FirmBillingInvoice', 'FirmOnboardingProgress'];
  for (const t of tablesToCheck) {
    const q = await prisma.$queryRaw<any[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${t}
    `;
    console.log(`${t}: ${q.length ? '✓ exists' : '✗ missing'}`);
  }

  // Count a few rows to indicate health
  const planCount = await prisma.firmPlan.count().catch(() => 0);
  const flagCount = await prisma.firmFeatureFlag.count().catch(() => 0);
  const onboardCount = await prisma.firmOnboardingProgress.count().catch(() => 0);

  console.log('\n✓ = Implemented | ✗ = Missing | ⚠ = Needs review\n');
  console.log(`${planCount > 0 ? '✓' : '✗'} FirmPlan entries (${planCount})`);
  console.log(`${flagCount > 0 ? '✓' : '✗'} FirmFeatureFlag entries (${flagCount})`);
  console.log(`${onboardCount > 0 ? '✓' : '✗'} FirmOnboardingProgress entries (${onboardCount})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
