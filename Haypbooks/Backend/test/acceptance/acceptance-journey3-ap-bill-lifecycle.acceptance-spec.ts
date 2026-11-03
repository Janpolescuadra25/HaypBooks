import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/repositories/prisma/prisma.service';
import { AccountingService } from '../../src/accounting/accounting.service';
import { ApService } from '../../src/ap/ap.service';
import { SubLedgerService } from '../../src/shared/sub-ledger.service';
import { createAcceptanceTestApp, closeAcceptanceTestApp } from './shared/acceptance-harness';

describe('Phase 17 Journey 3: AP Bill Lifecycle Acceptance Tests (Direct Service)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountingService: AccountingService;
  let apService: ApService;
  let subLedgerService: SubLedgerService;

  let testWorkspace: any;
  let foreignWorkspace: any;
  let testCompany: any;
  let foreignCompany: any;
  let testVendor: any;
  let creatorUser: any;
  let approverUser: any;
  let foreignUser: any;

  let expenseAccount: any;
  let apAccount: any;
  let cashAccount: any;
  let bankAccount: any;

  let createdBillId: string;

  beforeAll(async () => {
    const harness = await createAcceptanceTestApp();
    app = (harness as any).app || harness;
    prisma = app.get(PrismaService);
    accountingService = app.get(AccountingService);
    apService = app.get(ApService);
    subLedgerService = app.get(SubLedgerService);

    const timestamp = Date.now();

    creatorUser = await prisma.user.create({
      data: {
        email: `creator-direct-${timestamp}@haypbooks.test`,
        name: 'Direct Test Creator',
        password: 'hashed_password',
      },
    });

    approverUser = await prisma.user.create({
      data: {
        email: `approver-direct-${timestamp}@haypbooks.test`,
        name: 'Direct Test Approver',
        password: 'hashed_password',
      },
    });

    foreignUser = await prisma.user.create({
      data: {
        email: `foreign-direct-${timestamp}@haypbooks.test`,
        name: 'Direct Foreign User',
        password: 'hashed_password',
      },
    });

    testWorkspace = await prisma.workspace.create({ data: { ownerUserId: creatorUser.id } });
    foreignWorkspace = await prisma.workspace.create({ data: { ownerUserId: foreignUser.id } });

    const creatorRole = await prisma.role.create({
      data: { workspaceId: testWorkspace.id, name: 'OWNER' },
    });
    const approverRole = await prisma.role.create({
      data: { workspaceId: testWorkspace.id, name: 'APPROVER' },
    });
    const foreignOwnerRole = await prisma.role.create({
      data: { workspaceId: foreignWorkspace.id, name: 'OWNER' },
    });

    await prisma.workspaceUser.create({
      data: {
        workspaceId: testWorkspace.id,
        userId: creatorUser.id,
        roleId: creatorRole.id,
        isOwner: true,
        status: 'ACTIVE',
      },
    });
    await prisma.workspaceUser.create({
      data: {
        workspaceId: testWorkspace.id,
        userId: approverUser.id,
        roleId: approverRole.id,
        status: 'ACTIVE',
      },
    });
    await prisma.workspaceUser.create({
      data: {
        workspaceId: foreignWorkspace.id,
        userId: foreignUser.id,
        roleId: foreignOwnerRole.id,
        isOwner: true,
        status: 'ACTIVE',
      },
    });

    testCompany = await prisma.company.create({
      data: {
        workspaceId: testWorkspace.id,
        name: `J3 AP Direct Company ${timestamp}`,
        currency: 'USD',
      },
    });

    foreignCompany = await prisma.company.create({
      data: {
        workspaceId: foreignWorkspace.id,
        name: `J3 Foreign Direct Company ${timestamp}`,
        currency: 'USD',
      },
    });

    await prisma.companyUser.create({
      data: {
        companyId: testCompany.id,
        workspaceId: testWorkspace.id,
        userId: creatorUser.id,
      },
    });
    await prisma.companyUser.create({
      data: {
        companyId: testCompany.id,
        workspaceId: testWorkspace.id,
        userId: approverUser.id,
      },
    });

    await accountingService.seedDefaultAccounts(testCompany.id);

    expenseAccount = await prisma.account.findFirst({
      where: { companyId: testCompany.id, code: '5010' },
    });
    if (!expenseAccount) {
      expenseAccount = await prisma.account.findFirst({
        where: { companyId: testCompany.id, type: { name: 'EXPENSE' } },
        include: { type: true },
      });
    }

    apAccount = await prisma.account.findFirst({
      where: { companyId: testCompany.id, code: '2010' },
    });
    if (!apAccount) {
      apAccount = await prisma.account.findFirst({
        where: { companyId: testCompany.id, type: { name: 'LIABILITY' } },
        include: { type: true },
      });
    }

    cashAccount = await prisma.account.findFirst({
      where: { companyId: testCompany.id, code: '1010' },
    });
    if (!cashAccount) {
      cashAccount = await prisma.account.findFirst({
        where: { companyId: testCompany.id, type: { name: 'ASSET' } },
        include: { type: true },
      });
    }

    bankAccount = await prisma.bankAccount.create({
      data: {
        workspaceId: testWorkspace.id,
        name: 'Operating Cash Account',
        institution: 'Test Bank',
        accountNumber: '1010',
        glAccountId: cashAccount.id,
      },
    });

    expect(expenseAccount).toBeDefined();
    expect(apAccount).toBeDefined();
    expect(cashAccount).toBeDefined();
    expect(bankAccount).toBeDefined();

    const contact = await prisma.contact.create({
      data: {
        workspaceId: testWorkspace.id,
        type: 'VENDOR',
        displayName: `Vendor J3 Direct ${timestamp}`,
      },
    });

    testVendor = await prisma.vendor.create({
      data: {
        contactId: contact.id,
        workspaceId: testWorkspace.id,
      },
    });
  });

  afterAll(async () => {
    try {
      if (testCompany) {
        await prisma.billLine.deleteMany({ where: { bill: { companyId: testCompany.id } } }).catch(() => {});
        await prisma.billPayment.deleteMany({ where: { bill: { companyId: testCompany.id } } }).catch(() => {});
        await prisma.bill.deleteMany({ where: { companyId: testCompany.id } }).catch(() => {});
        await prisma.bankAccount.deleteMany({ where: { workspaceId: testWorkspace.id } }).catch(() => {});
        await prisma.vendor.deleteMany({ where: { workspaceId: testWorkspace.id } }).catch(() => {});
        await prisma.contact.deleteMany({ where: { workspaceId: testWorkspace.id } }).catch(() => {});
        await prisma.journalEntryLine.deleteMany({ where: { companyId: testCompany.id } }).catch(() => {});
        await prisma.journalEntry.deleteMany({ where: { companyId: testCompany.id } }).catch(() => {});
        await prisma.account.deleteMany({ where: { companyId: testCompany.id } }).catch(() => {});
        await prisma.companyUser.deleteMany({ where: { companyId: testCompany.id } }).catch(() => {});
        await prisma.company.delete({ where: { id: testCompany.id } }).catch(() => {});
        await prisma.workspaceUser.deleteMany({ where: { workspaceId: testWorkspace.id } }).catch(() => {});
        await prisma.role.deleteMany({ where: { workspaceId: testWorkspace.id } }).catch(() => {});
        await prisma.workspace.delete({ where: { id: testWorkspace.id } }).catch(() => {});
      }
      if (foreignCompany) {
        await prisma.companyUser.deleteMany({ where: { companyId: foreignCompany.id } }).catch(() => {});
        await prisma.company.delete({ where: { id: foreignCompany.id } }).catch(() => {});
        await prisma.workspaceUser.deleteMany({ where: { workspaceId: foreignWorkspace.id } }).catch(() => {});
        await prisma.role.deleteMany({ where: { workspaceId: foreignWorkspace.id } }).catch(() => {});
        await prisma.workspace.delete({ where: { id: foreignWorkspace.id } }).catch(() => {});
      }
      if (creatorUser) await prisma.user.delete({ where: { id: creatorUser.id } }).catch(() => {});
      if (approverUser) await prisma.user.delete({ where: { id: approverUser.id } }).catch(() => {});
      if (foreignUser) await prisma.user.delete({ where: { id: foreignUser.id } }).catch(() => {});
    } finally {
      if (app) {
        await closeAcceptanceTestApp(app).catch(async () => {
          await app.close();
        });
      }
    }
  });

  async function callCreateBill(userId: string, companyId: string, dto: any) {
    if (typeof apService.createBill === 'function') {
      return await apService.createBill(userId, companyId, dto);
    }
    if (typeof (apService as any).create === 'function') {
      return await (apService as any).create(userId, companyId, dto);
    }
    throw new Error('ApService does not expose createBill or create');
  }

  async function callSubmitBill(userId: string, companyId: string, billId: string) {
    if (typeof apService.submitBill === 'function') {
      return await apService.submitBill(userId, companyId, billId);
    }
    if (typeof (apService as any).submit === 'function') {
      return await (apService as any).submit(userId, companyId, billId);
    }
    throw new Error('ApService does not expose submitBill or submit');
  }

  async function callApproveBill(userId: string, companyId: string, billId: string) {
    if (typeof apService.approveBill === 'function') {
      return await apService.approveBill(userId, companyId, billId);
    }
    if (typeof (apService as any).approve === 'function') {
      return await (apService as any).approve(userId, companyId, billId);
    }
    throw new Error('ApService does not expose approveBill or approve');
  }

  async function callPayBill(userId: string, companyId: string, billId: string, dto: any) {
    if (typeof (apService as any).recordPayment === 'function') {
      return await (apService as any).recordPayment(userId, companyId, billId, dto);
    }
    if (typeof (apService as any).payBill === 'function') {
      return await (apService as any).payBill(userId, companyId, billId, dto);
    }
    if (typeof (apService as any).pay === 'function') {
      return await (apService as any).pay(userId, companyId, billId, dto);
    }
    throw new Error('ApService does not expose recordPayment, payBill, or pay');
  }

  describe('Scenario 1: Bill Creation & Validation', () => {
    it('should reject bill creation with missing lines (validation failure)', async () => {
      const invalidData = {
        vendorId: testVendor.contactId,
        billNumber: 'INV-INVALID-001',
        lines: [],
      };
      await expect(callCreateBill(creatorUser.id, testCompany.id, invalidData)).rejects.toThrow();
    });

    it('should successfully create an AP bill with expense account lines', async () => {
      const billData = {
        vendorId: testVendor.contactId,
        billNumber: `BILL-J3-${Date.now()}`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 86400000 * 30),
        lines: [
          {
            description: 'Office Operating Supplies',
            quantity: 2,
            unitPrice: 5000,
            amount: 10000,
            accountId: expenseAccount.id,
          },
        ],
      };

      const bill = await callCreateBill(creatorUser.id, testCompany.id, billData);
      expect(bill).toBeDefined();
      expect(bill.id).toBeDefined();
      createdBillId = bill.id;
      expect(['DRAFT', 'PENDING']).toContain(bill.status);
    });
  });

  describe('Scenario 2: Separation of Duties & Anti-Self-Approval', () => {
    it('should reject approval attempt by the bill creator', async () => {
      await expect(callApproveBill(creatorUser.id, testCompany.id, createdBillId)).rejects.toThrow();

      const bill = await prisma.bill.findUnique({ where: { id: createdBillId } });
      expect(bill).not.toBeNull();
      if (!bill) throw new Error('Bill was not created');
      expect(bill.status).not.toBe('APPROVED');
    });
  });

  describe('Scenario 3: Multi-Entity Access Isolation', () => {
    it('should reject approval attempt with mismatched company ID', async () => {
      await expect(callApproveBill(approverUser.id, foreignCompany.id, createdBillId)).rejects.toThrow();
    });
  });

  describe('Scenario 4: Bill Approval & General Ledger Subledger Accrual', () => {
    it('should approve the bill and post balanced GL journal entry', async () => {
      await callSubmitBill(creatorUser.id, testCompany.id, createdBillId);

      const pendingBill = await prisma.bill.findUnique({ where: { id: createdBillId } });
      expect(pendingBill).not.toBeNull();
      if (!pendingBill) throw new Error('Bill was not created');
      expect(pendingBill.status).toBe('PENDING');

      const approvedBill = await callApproveBill(approverUser.id, testCompany.id, createdBillId);
      expect(approvedBill).toBeDefined();
      expect(approvedBill.status).toBe('APPROVED');

      const bill = await prisma.bill.findUnique({ where: { id: createdBillId } });
      expect(bill).not.toBeNull();
      if (!bill) throw new Error('Bill was not created');
      expect(bill.status).toBe('APPROVED');
      expect(bill.journalEntryId).toBeTruthy();
      if (!bill.journalEntryId) throw new Error('Bill did not generate a journal entry');

      const journalEntry = await prisma.journalEntry.findUnique({
        where: { id: bill.journalEntryId },
        include: { lines: true },
      });

      expect(journalEntry).toBeDefined();
      if (!journalEntry) throw new Error('Journal entry not found');
      expect(journalEntry.postingStatus).toBe('POSTED');

      const lines = journalEntry.lines;
      expect(lines.length).toBeGreaterThanOrEqual(2);

      const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
      const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
      expect(totalDebit).toBeCloseTo(totalCredit, 2);
      expect(totalDebit).toBeCloseTo(10000, 2);

      const hasExpenseDebit = lines.some((l) => l.accountId === expenseAccount.id && Number(l.debit) > 0);
      const hasApCredit = lines.some((l) => l.accountId === apAccount.id && Number(l.credit) > 0);
      expect(hasExpenseDebit).toBe(true);
      expect(hasApCredit).toBe(true);
    });
  });

  describe('Scenario 5: Bill Payment & GL Subledger Settlement', () => {
    it('should record payment and post balanced cash settlement to GL', async () => {
      const paymentData = {
        amount: 10000,
        paymentDate: new Date(),
        method: 'CASH',
        reference: 'CHK-J3-001',
        bankAccountId: bankAccount.id,
      };

      await callPayBill(approverUser.id, testCompany.id, createdBillId, paymentData);

      const updatedBill = await prisma.bill.findUnique({ where: { id: createdBillId } });
      expect(updatedBill).not.toBeNull();
      if (!updatedBill) throw new Error('Bill not found after payment');
      expect(updatedBill.status).toBe('PAID');

      const payment = await prisma.billPayment.findFirst({
        where: { billId: createdBillId },
      });

      expect(payment).toBeDefined();
      if (!payment) throw new Error('Bill payment was not created');
      expect(payment.journalEntryId).toBeTruthy();
      if (!payment.journalEntryId) throw new Error('Bill payment did not generate a journal entry');

      const payJournalEntry = await prisma.journalEntry.findUnique({
        where: { id: payment.journalEntryId },
        include: { lines: true },
      });

      expect(payJournalEntry).toBeDefined();
      if (!payJournalEntry) throw new Error('Payment journal entry not found');
      expect(payJournalEntry.postingStatus).toBe('POSTED');

      const payLines = payJournalEntry.lines;
      expect(payLines.length).toBeGreaterThanOrEqual(2);

      const totalDebit = payLines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
      const totalCredit = payLines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
      expect(totalDebit).toBeCloseTo(totalCredit, 2);
      expect(totalDebit).toBeCloseTo(10000, 2);

      const hasApDebit = payLines.some((l) => l.accountId === apAccount.id && Number(l.debit) > 0);
      const hasCashCredit = payLines.some((l) => l.accountId === cashAccount.id && Number(l.credit) > 0);
      expect(hasApDebit).toBe(true);
      expect(hasCashCredit).toBe(true);
    });
  });

  describe('Scenario 6: Immutability & Re-Payment Guards', () => {
    it('should reject duplicate payment recording on an already settled bill', async () => {
      const overpaymentData = {
        amount: 5000,
        paymentDate: new Date(),
        method: 'CASH',
      };

      await expect(
        callPayBill(approverUser.id, testCompany.id, createdBillId, overpaymentData)
      ).rejects.toThrow();
    });
  });
});