import { BadRequestException } from '@nestjs/common'
import { SubLedgerService } from '../../../src/shared/sub-ledger.service'

jest.mock('../../../src/shared/gl-integration', () => ({
  createReversingJE: jest.fn(),
  createAndPostJE: jest.fn(),
  resolveAccount: jest.fn(),
  SYSTEM_ACCOUNTS: { ACCOUNTS_PAYABLE: 'AP', CASH: 'CASH' },
}))

const glIntegration = jest.requireMock('../../../src/shared/gl-integration')

describe('SubLedgerService Reversal Methods', () => {
  let mockPrisma: any
  let service: SubLedgerService

  beforeEach(() => {
    jest.resetAllMocks()
    mockPrisma = {
      expenseClaim: { findUnique: jest.fn(), update: jest.fn() },
      journalEntry: { findFirst: jest.fn() },
      mileageLog: { findUnique: jest.fn(), update: jest.fn() },
      perDiemClaim: { findUnique: jest.fn(), update: jest.fn() },
      vendorCredit: { findUnique: jest.fn(), update: jest.fn() },
    }
    service = new SubLedgerService(mockPrisma as any)
    ;(service as any).assertPeriodOpen = jest.fn().mockResolvedValue(undefined)
  })

  it('postMileageReversalToGL should reverse and mark VOIDED', async () => {
    mockPrisma.mileageLog.findUnique.mockResolvedValue({ id: 'm1', companyId: 'company-1', journalEntryId: 'je-1' })
    mockPrisma.mileageLog.update.mockResolvedValue({ id: 'm1', postingStatus: 'VOIDED' })

    await service.postMileageReversalToGL('m1', mockPrisma)

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-1', 'Void mileage log m1')
    expect(mockPrisma.mileageLog.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { postingStatus: 'VOIDED' } })
  })

  it('postMileageReversalToGL should throw if no journalEntryId exists', async () => {
    mockPrisma.mileageLog.findUnique.mockResolvedValue({ id: 'm1', companyId: 'company-1' })

    await expect(service.postMileageReversalToGL('m1', mockPrisma)).rejects.toThrow(BadRequestException)
  })

  it('postPerDiemReversalToGL should reverse and mark VOIDED', async () => {
    mockPrisma.perDiemClaim.findUnique.mockResolvedValue({ id: 'p1', companyId: 'company-1', journalEntryId: 'je-2' })
    mockPrisma.perDiemClaim.update.mockResolvedValue({ id: 'p1', postingStatus: 'VOIDED' })

    await service.postPerDiemReversalToGL('p1', mockPrisma)

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-2', 'Void per diem p1')
    expect(mockPrisma.perDiemClaim.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { postingStatus: 'VOIDED' } })
  })

  it('postPerDiemReversalToGL should throw if no journalEntryId exists', async () => {
    mockPrisma.perDiemClaim.findUnique.mockResolvedValue({ id: 'p1', companyId: 'company-1' })

    await expect(service.postPerDiemReversalToGL('p1', mockPrisma)).rejects.toThrow(BadRequestException)
  })

  it('postVendorCreditReversalToGL should reverse and mark VOIDED', async () => {
    mockPrisma.vendorCredit.findUnique.mockResolvedValue({ id: 'vc1', companyId: 'company-1', journalEntryId: 'je-3' })
    mockPrisma.vendorCredit.update.mockResolvedValue({ id: 'vc1', postingStatus: 'VOIDED' })

    await service.postVendorCreditReversalToGL('vc1', mockPrisma)

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-3', 'Void vendor credit vc1')
    expect(mockPrisma.vendorCredit.update).toHaveBeenCalledWith({ where: { id: 'vc1' }, data: { postingStatus: 'VOIDED' } })
  })

  it('postVendorCreditReversalToGL should throw if no journalEntryId exists', async () => {
    mockPrisma.vendorCredit.findUnique.mockResolvedValue({ id: 'vc1', companyId: 'company-1' })

    await expect(service.postVendorCreditReversalToGL('vc1', mockPrisma)).rejects.toThrow(BadRequestException)
  })

  it('postExpenseClaimReversalToGL should reverse and mark VOIDED', async () => {
    mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'c1', companyId: 'company-1', journalEntryId: 'je-4' })
    mockPrisma.expenseClaim.update.mockResolvedValue({ id: 'c1', postingStatus: 'VOIDED' })

    await service.postExpenseClaimReversalToGL('c1', mockPrisma)

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-4', 'Void expense claim c1')
    expect(mockPrisma.expenseClaim.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { postingStatus: 'VOIDED' } })
  })

  it('postExpenseClaimReversalToGL should throw if no journalEntryId exists', async () => {
    mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'c1', companyId: 'company-1' })

    await expect(service.postExpenseClaimReversalToGL('c1', mockPrisma)).rejects.toThrow(BadRequestException)
  })

  it('postExpenseReimbursementReversalToGL should reverse and mark a reimbursement JE void', async () => {
    mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'r1', companyId: 'company-1' })
    mockPrisma.journalEntry.findFirst.mockResolvedValue({ id: 'je-5' })

    await service.postExpenseReimbursementReversalToGL('r1', mockPrisma)

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-5', 'Void expense reimbursement r1')
  })

  it('postExpenseReimbursementReversalToGL should throw if reimbursement JE is missing', async () => {
    mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'r1', companyId: 'company-1' })
    mockPrisma.journalEntry.findFirst.mockResolvedValue(null)

    await expect(service.postExpenseReimbursementReversalToGL('r1', mockPrisma)).rejects.toThrow(BadRequestException)
  })
})
