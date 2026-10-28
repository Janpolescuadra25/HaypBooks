import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/repositories/prisma/prisma.service';
import { OnboardingService } from '../../../src/onboarding/onboarding.service';
import { ContactsService } from '../../../src/contacts/contacts.service';
import { ArService } from '../../../src/ar/ar.service';

export interface AcceptanceTestContext {
  app: INestApplication;
  moduleFixture: TestingModule;
  prisma: PrismaService;
  onboardingService: OnboardingService;
  contactsService: ContactsService;
  arService: ArService;
}

/**
 * Creates and boots an isolated NestJS application instance for acceptance testing.
 */
export async function createAcceptanceTestApp(): Promise<AcceptanceTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  const prisma = app.get(PrismaService);
  const onboardingService = app.get(OnboardingService);
  const contactsService = app.get(ContactsService);
  const arService = app.get(ArService);

  return {
    app,
    moduleFixture,
    prisma,
    onboardingService,
    contactsService,
    arService,
  };
}

/**
 * Generates an isolated unique identifier for test data isolation.
 */
export function uniqueTestId(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Helper to safely close app instance during teardown.
 */
export async function closeAcceptanceTestApp(app?: INestApplication): Promise<void> {
  if (app) {
    await app.close();
  }
}
