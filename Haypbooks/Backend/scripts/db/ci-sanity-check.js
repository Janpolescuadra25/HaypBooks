const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const tenantCount = await prisma.tenant.count();

    console.log('ci-sanity-check: tenants=', tenantCount);

    // Simple thresholds - fail the job if critical seeded data missing
    const errors = [];
    if (tenantCount < 1) errors.push('expected ≥1 tenant');

    if (errors.length) {
      console.error('CI sanity check failed:', errors.join('; '));
      process.exit(2);
    }

    console.log('CI sanity check passed');
    process.exit(0);
  } catch (e) {
    console.error('CI sanity check error', e);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
})();