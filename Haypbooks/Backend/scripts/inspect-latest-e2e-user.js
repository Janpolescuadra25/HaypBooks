const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const user = await p.user.findFirst({ where: { email: { startsWith: 'e2e-onboarding-' } }, orderBy: { createdAt: 'desc' } });
    console.log('user:', user ? user.email : user);
    if (!user) return;
    const step = await p.onboardingStep.findFirst({ where: { userId: user.id, step: 'business' }, orderBy: { createdAt: 'desc' } });
    console.log('business step:', step ? step.data : null);
    const tenantUsers = await p.tenantUser.findMany({ where: { userId: user.id } });
    console.log('tenantUsers:', tenantUsers);
    const tenantIds = tenantUsers.map(t => t.tenantId);
    const companies = await p.company.findMany({ where: { tenantId: { in: tenantIds } } });
    console.log('companies:', companies);
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();