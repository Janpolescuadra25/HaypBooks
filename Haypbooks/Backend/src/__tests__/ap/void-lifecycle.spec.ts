import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ApService } from '../../../src/ap/ap.service'
import { ApRepository } from '../../../src/ap/ap.repository'
import { ExpensesService } from '../../../src/expenses/expenses.service'
import { ExpenseStatusTransitionGuard } from '../../../src/expenses/expense-status-transition.guard'

jest.mock('../../shared/gl-integration', () => ({
  resolveAccount: jest.fn(),
  createAndPostJE: jest.fn(),
  createReversingJE: jest.fn(),
  SYSTEM_ACCOUNTS: { ACCOUNTS_PAYABLE: 'AP', CASH: 'CASH' },
}))

const glIntegration = jest.requireMock('../../shared/gl-integration')

describe('Void Lifecycle', () => {
  let mockRepo: any
  let mockPrisma: any
  let mockSubLedger: any
  let mockAuditService: any
  let apService: ApService
  let apRepo: ApRepository
  let expensesService: ExpensesService

  beforeEach(() => {
    jest.resetAllMocks()

    mockAuditService = { log: jest.fn() }

    mockRepo = {
      findVendorCreditById: jest.fn(),
      createVendorCredit: jest.fn(),
      updateVendorCredit: jest.fn(),
      deleteVendorCredit: jest.fn(),
      voidBillPayment: jest.fn(),
      findBillById: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }) },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w1' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn(async (work: any) => (typeof work === 'function' ? await work(mockPrisma) : work)),
      vendorCredit: { update: jest.fn().mockResolvedValue({ id: 'credit-1', status: 'VOIDED', postingStatus: 'VOIDED' }) },
      mileageLog: { findFirst: jest.fn(), update: jest.fn().mockResolvedValue({ id: 'log-1', status: 'VOIDED' }) },
      perDiemClaim: { findFirst: jest.fn(), update: jest.fn().mockResolvedValue({ id: 'perdiem-1', status: 'VOIDED' }) },
      expenseClaim: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({ id: 'claim-1', status: 'VOIDED', postingStatus: 'VOIDED' }) },
      journalEntry: { findFirst: jest.fn() },
      billPayment: { findFirst: jest.fn(), update: jest.fn() },
      billPaymentApplication: { findMany: jest.fn(), delete: jest.fn() },
      bill: { findUnique: jest.fn(), update: jest.fn() },
    }

    mockSubLedger = {
      postVendorCreditReversalToGL: jest.fn().mockResolvedValue(undefined),
      postMileageReversalToGL: jest.fn().mockResolvedValue(undefined),
      postPerDiemReversalToGL: jest.fn().mockResolvedValue(undefined),
      postExpenseClaimReversalToGL: jest.fn().mockResolvedValue(undefined),
      postExpenseReimbursementReversalToGL: jest.fn().mockResolvedValue(undefined),
      postBillPaymentReversalToGL: jest.fn().mockResolvedValue(undefined),
    }

    apService = new ApService(mockRepo as any, mockPrisma as any, mockAuditService as any, mockSubLedger as any)
    apRepo = new ApRepository(mockPrisma as any)
    expensesService = new ExpensesService(
      {} as any,
      mockPrisma as any,
      {} as any,
      mockAuditService as any,
      mockSubLedger as any,
      new ExpenseStatusTransitionGuard({} as any),
      { validateExpenseAgainstPolicy: jest.fn().mockResolvedValue([]) } as any,
    )
  })

  describe('Bill Payment void', () => {
    it('should void a posted bill payment and reverse GL entries', async () => {
      mockPrisma.billPayment.findFirst.mockResolvedValue({ id: 'payment-1', companyId: 'company-1', journalEntryId: 'je-100' })
      mockPrisma.billPaymentApplication.findMany.mockResolvedValue([{ id: 'app-1', billId: 'bill-1', amount: 500 }])
      mockPrisma.bill.findUnique.mockResolvedValue({ id: 'bill-1', balance: 0, total: 500, status: 'PAID' })
      mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1' })
      mockPrisma.billPayment.update.mockResolvedValue({ id: 'payment-1', status: 'VOIDED', postingStatus: 'VOIDED' })

      const result = await apRepo.voidBillPayment('company-1', 'payment-1')

      expect(glIntegration.createReversingJE).not.toHaveBeenCalled()
      expect(mockPrisma.billPayment.update).toHaveBeenCalledWith({ where: { id: 'payment-1' }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
      expect(result).toEqual({ id: 'payment-1', status: 'VOIDED', postingStatus: 'VOIDED' })
    })

    it('should reject voiding a draft bill payment', async () => {
      mockPrisma.billPayment.findFirst.mockResolvedValue({ id: 'payment-1', companyId: 'company-1' })

      await expect(apRepo.voidBillPayment('company-1', 'payment-1')).rejects.toThrow(BadRequestException)
    })

    it('should void a posted bill payment through the service and reverse GL via subledger', async () => {
      mockPrisma.billPayment.findUnique.mockResolvedValue({ id: 'payment-1', companyId: 'company-1', postingStatus: 'POSTED' })
      mockRepo.voidBillPayment.mockResolvedValue({ id: 'payment-1', status: 'VOIDED', postingStatus: 'VOIDED' })

      const result = await apService.voidBillPayment('user-1', 'company-1', 'payment-1')

      expect(mockSubLedger.postBillPaymentReversalToGL).toHaveBeenCalledWith('payment-1', mockPrisma)
      expect(mockRepo.voidBillPayment).toHaveBeenCalledWith('company-1', 'payment-1', mockPrisma)
      expect(result).toEqual({ id: 'payment-1', status: 'VOIDED', postingStatus: 'VOIDED' })
    })
  })

  describe('Mileage void', () => {
    it('should void a posted mileage entry and reverse GL', async () => {
      mockPrisma.mileageLog.findFirst.mockResolvedValue({ id: 'log-1', companyId: 'company-1', status: 'APPROVED', postingStatus: 'POSTED' })
      mockPrisma.mileageLog.update.mockResolvedValue({ id: 'log-1', status: 'VOIDED' })

      const result = await apService.voidMileage('user-1', 'company-1', 'log-1')

      expect(mockSubLedger.postMileageReversalToGL).toHaveBeenCalledWith('log-1', mockPrisma)
      expect(mockPrisma.mileageLog.update).toHaveBeenCalledWith({ where: { id: 'log-1' }, data: { status: 'VOIDED' } })
      expect(result).toEqual({ id: 'log-1', status: 'VOIDED' })
    })
  })

  describe('Per Diem void', () => {
    it('should void a posted per diem and reverse GL', async () => {
      mockPrisma.perDiemClaim.findFirst.mockResolvedValue({ id: 'perdiem-1', companyId: 'company-1', status: 'APPROVED', postingStatus: 'POSTED' })
      mockPrisma.perDiemClaim.update.mockResolvedValue({ id: 'perdiem-1', status: 'VOIDED' })

      const result = await apService.voidPerDiem('user-1', 'company-1', 'perdiem-1')

      expect(mockSubLedger.postPerDiemReversalToGL).toHaveBeenCalledWith('perdiem-1', mockPrisma)
      expect(mockPrisma.perDiemClaim.update).toHaveBeenCalledWith({ where: { id: 'perdiem-1' }, data: { status: 'VOIDED' } })
      expect(result).toEqual({ id: 'perdiem-1', status: 'VOIDED' })
    })
  })

  describe('Vendor Credit void', () => {
    it('should void a posted vendor credit and reverse GL', async () => {
      mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', postingStatus: 'POSTED' })
      mockPrisma.vendorCredit.update.mockResolvedValue({ id: 'credit-1', status: 'VOIDED', postingStatus: 'VOIDED' })

      const result = await apService.voidVendorCredit('user-1', 'company-1', 'credit-1')

      expect(mockSubLedger.postVendorCreditReversalToGL).toHaveBeenCalledWith('credit-1', mockPrisma)
      expect(mockPrisma.vendorCredit.update).toHaveBeenCalledWith({ where: { id: 'credit-1' }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
      expect(result).toEqual({ id: 'credit-1', status: 'VOIDED', postingStatus: 'VOIDED' })
    })

    it('should reject voiding a draft vendor credit', async () => {
      mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', postingStatus: 'DRAFT' })

      await expect(apService.voidVendorCredit('user-1', 'company-1', 'credit-1')).rejects.toThrow(BadRequestException)
    })
  })

  describe('Expense Claim void', () => {
    it('should void an APPROVED claim (single reversal)', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'claim-1', companyId: 'company-1', status: 'APPROVED', postingStatus: 'POSTED' })
      mockPrisma.expenseClaim.update.mockResolvedValue({ id: 'claim-1', status: 'VOIDED', postingStatus: 'VOIDED' })

      const result = await expensesService.voidExpenseClaim('user-1', 'company-1', 'claim-1')

      expect(mockSubLedger.postExpenseClaimReversalToGL).toHaveBeenCalledWith('claim-1', mockPrisma)
      expect(mockSubLedger.postExpenseReimbursementReversalToGL).not.toHaveBeenCalled()
      expect(mockPrisma.expenseClaim.update).toHaveBeenCalledWith({ where: { id: 'claim-1' }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
      expect(result).toEqual({ id: 'claim-1', status: 'VOIDED', postingStatus: 'VOIDED' })
    })

    it('should void a PAID claim (double reversal)', async () => {
      mockPrisma.expenseClaim.findUnique.mockResolvedValue({ id: 'claim-2', companyId: 'company-1', status: 'PAID', postingStatus: 'POSTED' })
      mockPrisma.expenseClaim.update.mockResolvedValue({ id: 'claim-2', status: 'VOIDED', postingStatus: 'VOIDED' })

      const result = await expensesService.voidExpenseClaim('user-1', 'company-1', 'claim-2')

      expect(mockSubLedger.postExpenseReimbursementReversalToGL).toHaveBeenCalledWith('claim-2', mockPrisma)
      expect(mockSubLedger.postExpenseClaimReversalToGL).toHaveBeenCalledWith('claim-2', mockPrisma)
      expect(mockPrisma.expenseClaim.update).toHaveBeenCalledWith({ where: { id: 'claim-2' }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
      expect(result).toEqual({ id: 'claim-2', status: 'VOIDED', postingStatus: 'VOIDED' })
    })
  })
})
