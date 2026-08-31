import { BadRequestException } from '@nestjs/common'
import { SubLedgerService } from '../../../src/shared/sub-ledger.service'

jest.mock('../../../src/shared/gl-integration', () => ({
  resolveAccount: jest.fn(),
  SYSTEM_ACCOUNTS: { CASH: 'CASH' },
}))

const glIntegration = jest.requireMock('../../../src/shared/gl-integration')

describe('SubLedgerService payroll and fixed asset GL posting', () => {
  let mockPrisma: any
  let service: SubLedgerService

  beforeEach(() => {
    jest.resetAllMocks()
    mockPrisma = {
      $transaction: jest.fn(async (fn: any) => fn(mockPrisma)),
      payrollRun: { findFirst: jest.fn(), update: jest.fn() },
      paycheck: { aggregate: jest.fn() },
      fixedAssetDepreciation: { findFirst: jest.fn(), update: jest.fn() },
      assetDisposal: { findFirst: jest.fn(), update: jest.fn() },
    }
    service = new SubLedgerService(mockPrisma as any)
    ;(service as any).assertPeriodOpen = jest.fn().mockResolvedValue(undefined)
    ;(service as any).nextEntryNumber = jest.fn().mockResolvedValue('SEQ-000001')
    ;(service as any).createPostedJE = jest.fn().mockResolvedValue({ id: 'je-1' })
  })

  it('returns null when payroll run does not exist', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue(null)
    const result = await service.postPayrollRunToGL({ companyId: 'company-1', workspaceId: 'ws-1', payrollRunId: 'run-1' })
    expect(result).toBeNull()
  })

  it('returns existing journalEntryId when payroll run is already posted', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue({ id: 'run-1', companyId: 'company-1', startDate: new Date(), endDate: new Date(), journalEntryId: 'je-123', postingStatus: 'POSTED' })
    const result = await service.postPayrollRunToGL({ companyId: 'company-1', workspaceId: 'ws-1', payrollRunId: 'run-1' })
    expect(result).toBe('je-123')
  })

  it('throws when payroll run has no paychecks', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue({ id: 'run-1', companyId: 'company-1', startDate: new Date(), endDate: new Date(), journalEntryId: null, postingStatus: 'DRAFT' })
    mockPrisma.paycheck.aggregate.mockResolvedValue({ _sum: { grossAmount: null, netAmount: null }, _count: { _all: 0 } })
    await expect(service.postPayrollRunToGL({ companyId: 'company-1', workspaceId: 'ws-1', payrollRunId: 'run-1' })).rejects.toThrow(BadRequestException)
  })

  it('throws when required payroll GL accounts are missing', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue({ id: 'run-1', companyId: 'company-1', startDate: new Date(), endDate: new Date(), journalEntryId: null, postingStatus: 'DRAFT' })
    mockPrisma.paycheck.aggregate.mockResolvedValue({ _sum: { grossAmount: 1000, netAmount: 900 }, _count: { _all: 1 } })
    glIntegration.resolveAccount.mockResolvedValueOnce(null)
    await expect(service.postPayrollRunToGL({ companyId: 'company-1', workspaceId: 'ws-1', payrollRunId: 'run-1' })).rejects.toThrow(BadRequestException)
  })

  it('creates a payroll JE and updates the payroll run on success', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue({ id: 'run-1', companyId: 'company-1', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-15'), journalEntryId: null, postingStatus: 'DRAFT' })
    mockPrisma.paycheck.aggregate.mockResolvedValue({ _sum: { grossAmount: 1200, netAmount: 1100 }, _count: { _all: 1 } })
    glIntegration.resolveAccount.mockImplementation(async (_db: any, _companyId: string, preferred: any) => {
      if (preferred?.code === '6010') return { id: 'acct-salary' }
      if (preferred?.code === '2030') return { id: 'acct-accrued' }
      if (preferred?.code === '2070') return { id: 'acct-deductions' }
      return { id: 'acct-default' }
    })

    const result = await service.postPayrollRunToGL({ companyId: 'company-1', workspaceId: 'ws-1', payrollRunId: 'run-1' })
    expect(result).toBe('je-1')
    expect((service as any).createPostedJE).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      workspaceId: 'ws-1',
      companyId: 'company-1',
      transactionSource: 'Payroll Run',
      sourceReferenceId: 'run-1',
      lines: expect.arrayContaining([
        expect.objectContaining({ accountId: 'acct-salary', debit: 1200, credit: 0 }),
        expect.objectContaining({ accountId: 'acct-accrued', debit: 0, credit: 1100 }),
      ]),
    }))
    expect(mockPrisma.payrollRun.update).toHaveBeenCalledWith({ where: { id: 'run-1' }, data: { journalEntryId: 'je-1', postingStatus: 'POSTED', status: 'POSTED' } })
  })

  it('returns null when depreciation record does not exist', async () => {
    mockPrisma.fixedAssetDepreciation.findFirst.mockResolvedValue(null)
    const result = await service.postAssetDepreciationToGL({ companyId: 'company-1', workspaceId: 'ws-1', depreciationId: 'dep-1', amount: 100, date: new Date() })
    expect(result).toBeNull()
  })

  it('returns existing journalEntryId when depreciation is already posted', async () => {
    mockPrisma.fixedAssetDepreciation.findFirst.mockResolvedValue({ id: 'dep-1', companyId: 'company-1', journalEntryId: 'je-123', postingStatus: 'POSTED', asset: { depreciationExpenseAccountId: 'acct-exp', accumulatedDepreciationId: 'acct-accum' } })
    const result = await service.postAssetDepreciationToGL({ companyId: 'company-1', workspaceId: 'ws-1', depreciationId: 'dep-1', amount: 100, date: new Date() })
    expect(result).toBe('je-123')
  })

  it('throws when depreciation amount is zero or near zero', async () => {
    mockPrisma.fixedAssetDepreciation.findFirst.mockResolvedValue({ id: 'dep-1', companyId: 'company-1', journalEntryId: null, postingStatus: 'DRAFT', asset: { depreciationExpenseAccountId: 'acct-exp', accumulatedDepreciationId: 'acct-accum' } })
    await expect(service.postAssetDepreciationToGL({ companyId: 'company-1', workspaceId: 'ws-1', depreciationId: 'dep-1', amount: 0, date: new Date() })).rejects.toThrow(BadRequestException)
  })

  it('creates a depreciation JE and updates the depreciation record on success', async () => {
    mockPrisma.fixedAssetDepreciation.findFirst.mockResolvedValue({ id: 'dep-1', companyId: 'company-1', journalEntryId: null, postingStatus: 'DRAFT', asset: { depreciationExpenseAccountId: 'acct-exp', accumulatedDepreciationId: 'acct-accum' } })
    const result = await service.postAssetDepreciationToGL({ companyId: 'company-1', workspaceId: 'ws-1', depreciationId: 'dep-1', amount: 150.75, date: new Date('2026-06-30') })
    expect(result).toBe('je-1')
    expect((service as any).createPostedJE).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      workspaceId: 'ws-1',
      companyId: 'company-1',
      transactionSource: 'Fixed Asset Depreciation',
      sourceReferenceId: 'dep-1',
      lines: expect.arrayContaining([
        expect.objectContaining({ accountId: 'acct-exp', debit: 150.75, credit: 0 }),
        expect.objectContaining({ accountId: 'acct-accum', debit: 0, credit: 150.75 }),
      ]),
    }))
    expect(mockPrisma.fixedAssetDepreciation.update).toHaveBeenCalledWith({ where: { id: 'dep-1' }, data: { journalEntryId: 'je-1', postingStatus: 'POSTED' } })
  })

  it('returns null when asset disposal record does not exist', async () => {
    mockPrisma.assetDisposal.findFirst.mockResolvedValue(null)
    const result = await service.postAssetDisposalToGL({ companyId: 'company-1', workspaceId: 'ws-1', disposalId: 'disp-1', cost: 1000, accumulated: 400, proceeds: 200, date: new Date() })
    expect(result).toBeNull()
  })

  it('creates a disposal JE and updates the disposal record on success', async () => {
    mockPrisma.assetDisposal.findFirst.mockResolvedValue({
      id: 'disp-1', companyId: 'company-1', journalEntryId: null, postingStatus: 'DRAFT', asset: { assetAccountId: 'acct-asset', accumulatedDepreciationId: 'acct-accum' }, assetId: 'asset-1', disposalDate: new Date(), method: 'SALE', proceeds: 200,
    })
    glIntegration.resolveAccount.mockImplementation(async (_db: any, _companyId: string, preferred: any) => {
      if (preferred?.code === '4530') return { id: 'acct-gain' }
      if (preferred?.code === '9020') return { id: 'acct-loss' }
      return { id: 'acct-cash' }
    })

    const result = await service.postAssetDisposalToGL({ companyId: 'company-1', workspaceId: 'ws-1', disposalId: 'disp-1', cost: 1000, accumulated: 800, proceeds: 200, date: new Date('2026-06-30') })
    expect(result).toBe('je-1')
    expect((service as any).createPostedJE).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      workspaceId: 'ws-1',
      companyId: 'company-1',
      transactionSource: 'Fixed Asset Disposal',
      sourceReferenceId: 'disp-1',
      lines: expect.arrayContaining([
        expect.objectContaining({ accountId: 'acct-accum', debit: 800, credit: 0 }),
        expect.objectContaining({ accountId: 'acct-cash', debit: 200, credit: 0 }),
        expect.objectContaining({ accountId: 'acct-asset', debit: 0, credit: 1000 }),
      ]),
    }))
    expect(mockPrisma.assetDisposal.update).toHaveBeenCalledWith({ where: { id: 'disp-1' }, data: { journalEntryId: 'je-1', postingStatus: 'POSTED' } })
  })
})
