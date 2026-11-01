import { CompanyService } from '../../src/companies/company.service';
import { AccountingService } from '../../src/accounting/accounting.service';
import { createAcceptanceTestApp, closeAcceptanceTestApp, uniqueTestId, AcceptanceTestContext } from './shared/acceptance-harness';

jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-4000-8000-000000000001'),
}));

describe('Phase 17 Journey 2: Accountant Multi-Entity Lifecycle (Acceptance)', () => {
  let context: AcceptanceTestContext;
  let companyService: CompanyService;
  let accountingService: AccountingService;

  beforeAll(async () => {
    context = await createAcceptanceTestApp();
    companyService = context.moduleFixture.get(CompanyService);
    accountingService = context.moduleFixture.get(AccountingService);
  }, 60000);

  afterAll(async () => {
    await closeAcceptanceTestApp(context.app);
  });

  it('Flow 1: an accountant can be assigned to multiple workspaces and view both companies', async () => {
    const suffix = uniqueTestId('acct-multi');

    const ownerA = await context.prisma.user.create({
      data: { email: `owner-a-${suffix}@example.com`, name: 'Owner A', password: 'hashed_password' },
    });
    const ownerB = await context.prisma.user.create({
      data: { email: `owner-b-${suffix}@example.com`, name: 'Owner B', password: 'hashed_password' },
    });
    const accountant = await context.prisma.user.create({
      data: { email: `accountant-${suffix}@example.com`, name: 'Multi-Entity Accountant', password: 'hashed_password' },
    });

    const workspaceA = await context.prisma.workspace.create({ data: { ownerUserId: ownerA.id } });
    const workspaceB = await context.prisma.workspace.create({ data: { ownerUserId: ownerB.id } });

    const ownerRoleA = await context.prisma.role.create({ data: { workspaceId: workspaceA.id, name: 'OWNER' } });
    const accountantRoleA = await context.prisma.role.create({ data: { workspaceId: workspaceA.id, name: 'ACCOUNTANT' } });
    const ownerRoleB = await context.prisma.role.create({ data: { workspaceId: workspaceB.id, name: 'OWNER' } });
    const accountantRoleB = await context.prisma.role.create({ data: { workspaceId: workspaceB.id, name: 'ACCOUNTANT' } });

    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceA.id, userId: ownerA.id, roleId: ownerRoleA.id, isOwner: true, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceB.id, userId: ownerB.id, roleId: ownerRoleB.id, isOwner: true, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceA.id, userId: accountant.id, roleId: accountantRoleA.id, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceB.id, userId: accountant.id, roleId: accountantRoleB.id, status: 'ACTIVE' },
    });

    const companyA = await context.prisma.company.create({
      data: { workspaceId: workspaceA.id, name: `Alpha ${suffix}`, currency: 'USD' },
    });
    const companyB = await context.prisma.company.create({
      data: { workspaceId: workspaceB.id, name: `Beta ${suffix}`, currency: 'USD' },
    });

    const multiEntityList = await companyService.listCompaniesForUser(accountant.id);
    const companyIds = multiEntityList.map((company) => company.id);

    expect(companyIds).toEqual(expect.arrayContaining([companyA.id, companyB.id]));
    expect(await companyService.getCompanyForUser(accountant.id, companyA.id)).toBeTruthy();
    expect(await companyService.getCompanyForUser(accountant.id, companyB.id)).toBeTruthy();
  });

  it('Flow 2 & 3: cross-workspace access is rejected when the accountant is not a member', async () => {
    const suffix = uniqueTestId('acct-isolation');

    const ownerA = await context.prisma.user.create({
      data: { email: `owner-a-${suffix}@example.com`, name: 'Owner A', password: 'hashed_password' },
    });
    const ownerB = await context.prisma.user.create({
      data: { email: `owner-b-${suffix}@example.com`, name: 'Owner B', password: 'hashed_password' },
    });
    const accountant = await context.prisma.user.create({
      data: { email: `accountant-${suffix}@example.com`, name: 'Restricted Accountant', password: 'hashed_password' },
    });

    const workspaceA = await context.prisma.workspace.create({ data: { ownerUserId: ownerA.id } });
    const workspaceB = await context.prisma.workspace.create({ data: { ownerUserId: ownerB.id } });

    const ownerRoleA = await context.prisma.role.create({ data: { workspaceId: workspaceA.id, name: 'OWNER' } });
    const accountantRoleA = await context.prisma.role.create({ data: { workspaceId: workspaceA.id, name: 'ACCOUNTANT' } });
    const ownerRoleB = await context.prisma.role.create({ data: { workspaceId: workspaceB.id, name: 'OWNER' } });

    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceA.id, userId: ownerA.id, roleId: ownerRoleA.id, isOwner: true, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceB.id, userId: ownerB.id, roleId: ownerRoleB.id, isOwner: true, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspaceA.id, userId: accountant.id, roleId: accountantRoleA.id, status: 'ACTIVE' },
    });

    const companyA = await context.prisma.company.create({
      data: { workspaceId: workspaceA.id, name: `Alpha ${suffix}`, currency: 'USD' },
    });
    const companyB = await context.prisma.company.create({
      data: { workspaceId: workspaceB.id, name: `Beta ${suffix}`, currency: 'USD' },
    });

    expect(await companyService.getCompanyForUser(accountant.id, companyA.id)).toBeTruthy();
    expect(await companyService.getCompanyForUser(accountant.id, companyB.id)).toBeNull();
  });

  it('Flow 4: accountant role boundaries are enforced and double-entry postings stay balanced', async () => {
    const suffix = uniqueTestId('acct-role');

    const owner = await context.prisma.user.create({
      data: { email: `owner-${suffix}@example.com`, name: 'Owner', password: 'hashed_password' },
    });
    const accountant = await context.prisma.user.create({
      data: { email: `accountant-${suffix}@example.com`, name: 'Accountant', password: 'hashed_password' },
    });

    const workspace = await context.prisma.workspace.create({ data: { ownerUserId: owner.id } });
    const ownerRole = await context.prisma.role.create({ data: { workspaceId: workspace.id, name: 'OWNER' } });
    const accountantRole = await context.prisma.role.create({ data: { workspaceId: workspace.id, name: 'ACCOUNTANT' } });

    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspace.id, userId: owner.id, roleId: ownerRole.id, isOwner: true, status: 'ACTIVE' },
    });
    await context.prisma.workspaceUser.create({
      data: { workspaceId: workspace.id, userId: accountant.id, roleId: accountantRole.id, status: 'ACTIVE' },
    });

    const company = await context.prisma.company.create({
      data: { workspaceId: workspace.id, name: `Ledger ${suffix}`, currency: 'USD' },
    });

    await context.prisma.companyUser.create({
      data: { companyId: company.id, workspaceId: workspace.id, userId: accountant.id },
    });

    await expect(companyService.archiveCompany(accountant.id, company.id)).rejects.toThrow(
      'Only workspace owners can archive a company',
    );

    await accountingService.seedDefaultAccounts(company.id);

    const cashAccount = await context.prisma.account.findFirst({
      where: { companyId: company.id, name: { contains: 'Cash' } },
      include: { type: true },
    });
    const revenueAccount = await context.prisma.account.findFirst({
      where: { companyId: company.id, type: { name: 'INCOME' } },
      include: { type: true },
    });

    expect(cashAccount).toBeTruthy();
    expect(revenueAccount).toBeTruthy();

    const journal = await context.prisma.journalEntry.create({
      data: {
        workspaceId: workspace.id,
        companyId: company.id,
        date: new Date(),
        description: `Balanced entry ${suffix}`,
        currency: 'USD',
        postingStatus: 'POSTED',
      },
    });

    await context.prisma.journalEntryLine.createMany({
      data: [
        {
          journalId: journal.id,
          companyId: company.id,
          accountId: cashAccount!.id,
          workspaceId: workspace.id,
          debit: 1000,
          credit: 0,
          description: 'Cash debit',
        },
        {
          journalId: journal.id,
          companyId: company.id,
          accountId: revenueAccount!.id,
          workspaceId: workspace.id,
          debit: 0,
          credit: 1000,
          description: 'Revenue credit',
        },
      ],
    });

    const totals = await context.prisma.journalEntryLine.groupBy({
      by: ['journalId'],
      where: { journalId: journal.id },
      _sum: { debit: true, credit: true },
    });

    expect(Number(totals[0]._sum.debit ?? 0)).toBeCloseTo(Number(totals[0]._sum.credit ?? 0), 4);
  });
});
