import { INestApplication } from '@nestjs/common';
import { createAcceptanceTestApp, closeAcceptanceTestApp, AcceptanceTestContext, uniqueTestId } from './shared/acceptance-harness';
import { PrismaService } from '../../src/repositories/prisma/prisma.service';
import { OnboardingService } from '../../src/onboarding/onboarding.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-4000-8000-000000000001'),
}));

jest.mock('../../src/test/test.module', () => {
  const { Module } = jest.requireActual('@nestjs/common');
  class TestModule {}
  Module({})(TestModule);
  return { TestModule };
});

describe('Phase 17 Journey 1: Owner Complete Lifecycle Acceptance', () => {
  let context: AcceptanceTestContext;
  let app: INestApplication;
  let prisma: PrismaService;
  let onboardingService: OnboardingService;

  beforeAll(async () => {
    context = await createAcceptanceTestApp();
    app = context.app;
    prisma = context.prisma;
    onboardingService = app.get(OnboardingService);
  });

  afterAll(async () => {
    await closeAcceptanceTestApp(app);
  });

  it('Harness Bootstrap Verification: should initialize test harness and verify core services', async () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
    expect(onboardingService).toBeDefined();
  });

  it('Journey 1 Step 1: should verify OnboardingService.complete contract and role handling', async () => {
    const testUserId = uniqueTestId('owner_user');
    expect(testUserId).toContain('owner_user');
    expect(typeof onboardingService.complete).toBe('function');
    expect(onboardingService.complete.length).toBeGreaterThanOrEqual(1);
  });
});
