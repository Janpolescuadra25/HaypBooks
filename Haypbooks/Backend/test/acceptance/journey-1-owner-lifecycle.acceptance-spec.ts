import { INestApplication } from '@nestjs/common';
import { createAcceptanceTestApp, closeAcceptanceTestApp, AcceptanceTestContext, uniqueTestId } from './shared/acceptance-harness';
import { PrismaService } from '../../src/repositories/prisma/prisma.service';
import { OnboardingService } from '../../src/onboarding/onboarding.service';
import { ContactsService } from '../../src/contacts/contacts.service';
import { ArService } from '../../src/ar/ar.service';

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
  let contactsService: ContactsService;
  let arService: ArService;

  beforeAll(async () => {
    context = await createAcceptanceTestApp();
    app = context.app;
    prisma = context.prisma;
    onboardingService = context.onboardingService;
    contactsService = context.contactsService;
    arService = context.arService;
  });

  afterAll(async () => {
    await closeAcceptanceTestApp(app);
  });

  it('Harness Bootstrap Verification: should initialize test harness and verify core services', async () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
    expect(onboardingService).toBeDefined();
    expect(contactsService).toBeDefined();
    expect(arService).toBeDefined();
  });

  it('Journey 1 Contract Integrity: should expose the required domain operations', () => {
    expect(typeof onboardingService.complete).toBe('function');
    expect(typeof contactsService.createCustomer).toBe('function');
    expect(typeof arService.createInvoice).toBe('function');
    expect(typeof arService.sendInvoice).toBe('function');
    expect(typeof arService.recordPayment).toBe('function');
  });

  it('Journey 1 Flow: should complete owner onboarding through a paid, balanced invoice', async () => {
    const suffix = uniqueTestId('owner');
    const user = await prisma.user.create({
      data: {
        email: `${suffix}@example.com`,
        name: 'Journey Owner User',
        password: 'hashed_test_password',
      },
    });
    await prisma.onboardingData.create({
      data: {
        userId: user.id,
        steps: {
          owner_workspace: { workspaceName: `Journey Workspace ${suffix}` },
          business: { businessName: `Journey Company ${suffix}`, country: 'PH' },
          fiscal_tax: { currency: 'PHP' },
        },
      },
    });

    await onboardingService.complete(
      user.id,
      'full',
      'OWNER',
      'replace',
      undefined,
      `Journey Company ${suffix}`,
    );

    const companyUser = await prisma.companyUser.findFirst({
      where: { userId: user.id },
      include: { company: true },
    });
    expect(companyUser).not.toBeNull();
    const companyId = companyUser!.companyId;

    let accounts = await prisma.account.findMany({
      where: { companyId },
      include: { type: true },
    });
    for (let attempt = 0; accounts.length === 0 && attempt < 50; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      accounts = await prisma.account.findMany({
        where: { companyId },
        include: { type: true },
      });
    }
    expect(accounts.length).toBeGreaterThan(0);
    const salesAccount = accounts.find(
      (account) => account.type.category === 'REVENUE' || account.type.name === 'INCOME',
    );
    expect(salesAccount).toBeDefined();

    const customer = await contactsService.createCustomer(user.id, companyId, {
      displayName: `Acme Corp ${suffix}`,
      email: `${suffix}.customer@example.com`,
    });
    expect(customer.contactId).toBeDefined();

    const invoice = await arService.createInvoice(user.id, companyId, {
      customerId: customer.contactId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currency: 'PHP',
      lines: [
        {
          accountId: salesAccount!.id,
          quantity: 1,
          unitPrice: 1000,
          description: 'Initial Consulting Retainer',
        },
      ],
    });
    expect(invoice.id).toBeDefined();

    await arService.sendInvoice(user.id, companyId, invoice.id);
    const sentInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(sentInvoice?.status).toBe('SENT');

    const payment = await arService.recordPayment(user.id, companyId, {
      customerId: customer.contactId,
      amount: 1000,
      currency: 'PHP',
      paymentDate: new Date(),
      depositDestination: 'UNDEPOSITED_FUNDS',
      allocations: [{ invoiceId: invoice.id, amount: 1000 }],
    });
    expect(payment.id).toBeDefined();

    const paidInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(Number(paidInvoice?.balance)).toBe(0);

    const persistedPayment = await prisma.paymentReceived.findUnique({ where: { id: payment.id } });
    expect(paidInvoice?.journalEntryId).toBeTruthy();
    expect(persistedPayment?.journalEntryId).toBeTruthy();

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        companyId,
        id: { in: [paidInvoice!.journalEntryId!, persistedPayment!.journalEntryId!] },
      },
      include: { lines: true },
    });
    expect(journalEntries.length).toBeGreaterThanOrEqual(2);
    for (const entry of journalEntries) {
      expect(entry.lines.length).toBeGreaterThanOrEqual(2);
      const debits = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const credits = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      expect(debits).toBeGreaterThan(0);
      expect(debits).toBeCloseTo(credits, 2);
    }
  });
});
