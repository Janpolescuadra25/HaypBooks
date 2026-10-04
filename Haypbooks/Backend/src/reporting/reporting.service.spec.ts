import { Test, TestingModule } from '@nestjs/testing'
import { ReportingService } from './reporting.service'
import { ReportingRepository } from './reporting.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { ExchangeRateService } from '../currency/exchange-rate.service'

describe('ReportingService - Balance Sheet Current Year Earnings (Defect E4)', () => {
  let service: ReportingService
  let prisma: any

  beforeEach(async () => {
    prisma = {
      account: {
        findMany: jest.fn(),
      },
      company: {
        findUnique: jest.fn().mockResolvedValue({ fiscalYearStart: 1 }),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        { provide: ReportingRepository, useValue: {} },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ExchangeRateService,
          useValue: {
            resolveCurrency: jest.fn().mockResolvedValue('USD'),
            enforceCurrency: jest.fn().mockResolvedValue({ currency: 'USD', exchangeRate: 1, baseAmount: 1 }),
            convertAmount: jest.fn(async (amount: number) => amount),
          },
        },
      ],
    }).compile()

    service = module.get<ReportingService>(ReportingService)
  })

  const buildProfitableBalances = () => [
    {
      accountId: 'asset-1',
      accountCode: '1000',
      accountName: 'Cash',
      type: { category: 'ASSET' },
      AccountSubType: { name: 'Cash' },
      journalLines: [],
      netBalance: 1500,
    },
    {
      accountId: 'liability-1',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      type: { category: 'LIABILITY' },
      AccountSubType: { name: 'Current' },
      journalLines: [],
      netBalance: -500,
    },
    {
      accountId: 'equity-1',
      accountCode: '3000',
      accountName: 'Common Stock',
      type: { category: 'EQUITY' },
      AccountSubType: { name: 'Equity' },
      journalLines: [],
      netBalance: -200,
    },
    {
      accountId: 'revenue-1',
      accountCode: '4000',
      accountName: 'Service Revenue',
      type: { category: 'REVENUE' },
      AccountSubType: { name: 'Income' },
      journalLines: [],
      netBalance: -1000,
    },
    {
      accountId: 'expense-1',
      accountCode: '5000',
      accountName: 'Software Expense',
      type: { category: 'EXPENSE' },
      AccountSubType: { name: 'Operating' },
      journalLines: [],
      netBalance: 200,
    },
  ]

  const buildLossBalances = () => [
    {
      accountId: 'asset-1',
      accountCode: '1000',
      accountName: 'Cash',
      type: { category: 'ASSET' },
      AccountSubType: { name: 'Cash' },
      journalLines: [],
      netBalance: 300,
    },
    {
      accountId: 'liability-1',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      type: { category: 'LIABILITY' },
      AccountSubType: { name: 'Current' },
      journalLines: [],
      netBalance: -100,
    },
    {
      accountId: 'equity-1',
      accountCode: '3000',
      accountName: 'Common Stock',
      type: { category: 'EQUITY' },
      AccountSubType: { name: 'Equity' },
      journalLines: [],
      netBalance: -500,
    },
    {
      accountId: 'revenue-1',
      accountCode: '4000',
      accountName: 'Service Revenue',
      type: { category: 'REVENUE' },
      AccountSubType: { name: 'Income' },
      journalLines: [],
      netBalance: -200,
    },
    {
      accountId: 'expense-1',
      accountCode: '5000',
      accountName: 'Software Expense',
      type: { category: 'EXPENSE' },
      AccountSubType: { name: 'Operating' },
      journalLines: [],
      netBalance: 500,
    },
  ]

  it('should include a positive current-year earnings line and keep the interim balance sheet balanced for net profit', async () => {
    prisma.account.findMany.mockResolvedValue(buildProfitableBalances())

    const sheet = await (service as any)._buildBalanceSheet('company-1', new Date('2026-06-15'))

    expect(sheet.isBalanced).toBe(true)
    expect(sheet.totalEquity).toBe(1000)

    const earningsLine = sheet.sections.equity.accounts.find(
      (row: any) => row.accountName === 'Current-Year Earnings (Net Income)',
    )

    expect(earningsLine).toEqual(expect.objectContaining({ accountCode: '3999', balance: 800 }))
  })

  it('should include a negative current-year earnings line and keep the interim balance sheet balanced for a net loss', async () => {
    prisma.account.findMany.mockResolvedValue(buildLossBalances())

    const sheet = await (service as any)._buildBalanceSheet('company-1', new Date('2026-06-15'))

    expect(sheet.isBalanced).toBe(true)
    expect(sheet.totalEquity).toBe(200)

    const earningsLine = sheet.sections.equity.accounts.find(
      (row: any) => row.accountName === 'Current-Year Earnings (Net Income)',
    )

    expect(earningsLine).toEqual(expect.objectContaining({ accountCode: '3999', balance: -300 }))
  })

  it('should keep isBalanced true for interim reporting dates when the current-year earnings line is present', async () => {
    prisma.account.findMany.mockResolvedValue(buildProfitableBalances())

    const interimAsOf = new Date('2026-06-15')
    const sheet = await (service as any)._buildBalanceSheet('company-1', interimAsOf)

    expect(sheet.asOf).toEqual(interimAsOf)
    expect(sheet.isBalanced).toBe(true)
    expect(sheet.sections.equity.accounts.some((row: any) => row.accountName === 'Current-Year Earnings (Net Income)')).toBe(true)
  })
})
