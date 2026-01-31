import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Firm models migration', () => {
  afterAll(async () => await prisma.$disconnect());

  test('Firm tables exist', async () => {
    const q = await prisma.$queryRaw<any[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('FirmPlan','FirmPlanFeature','FirmFeatureFlag','FirmBillingInvoice','FirmOnboardingProgress')
    `;

    const found = q.map(r => r.table_name);
    expect(found).toEqual(expect.arrayContaining(['FirmPlan','FirmPlanFeature','FirmFeatureFlag','FirmBillingInvoice','FirmOnboardingProgress']));
  });
});
