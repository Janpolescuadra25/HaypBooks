import { ApRepository } from '../../../src/ap/ap.repository'
import * as glIntegration from '../../shared/gl-integration'

jest.mock('../../shared/gl-integration', () => ({
  resolveAccount: jest.fn(),
  createAndPostJE: jest.fn(),
  createReversingJE: jest.fn(),
  SYSTEM_ACCOUNTS: { ACCOUNTS_PAYABLE: 'AP', CASH: 'CASH' },
}))

describe('ApRepository - GL Integrity', () => {
  let mockPrisma: any
  let repo: ApRepository

  beforeEach(() => {
    jest.resetAllMocks()

    mockPrisma = {
      billPayment: {
        create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
        update: jest.fn().mockResolvedValue({ id: 'payment-1', journalEntryId: 'je-1' }),
      },
      billPaymentApplication: { create: jest.fn().mockResolvedValue({}) },
      bill: {
        findUnique: jest.fn().mockResolvedValue({ id: 'bill-1', balance: 1000 }),
        update: jest.fn().mockResolvedValue({ id: 'bill-1', balance: 0, status: 'PAID' }),
      },
      account: { findUnique: jest.fn().mockResolvedValue({ id: 'bank-1010' }) },
      $transaction: jest.fn(async (work: any) => (typeof work === 'function' ? await work(mockPrisma) : work)),
    }

    repo = new ApRepository(mockPrisma as any)
  })

  test('recordBillPayment stores the payment and updates the related bill without direct GL posting', async () => {
    await repo.recordBillPayment({
      workspaceId: 'w1',
      companyId: 'company-1',
      billId: 'bill-1',
      amount: 1000,
      paymentDate: new Date('2025-01-01'),
      method: 'CASH',
      createdById: 'user-1',
      applications: [{ billId: 'bill-1', amount: 1000 }],
    })

    expect(glIntegration.createAndPostJE).not.toHaveBeenCalled()
    expect(mockPrisma.billPayment.create).toHaveBeenCalledTimes(1)
    expect(mockPrisma.billPaymentApplication.create).toHaveBeenCalledTimes(1)
    expect(mockPrisma.bill.update).toHaveBeenCalledWith({
      where: { id: 'bill-1' },
      data: { balance: 0, status: 'PAID', paymentStatus: 'PAID' },
    })
  })

  test('voidBill creates a reversing JE when a posted bill exists', async () => {
    mockPrisma.bill.findFirst = jest.fn().mockResolvedValue({ id: 'bill-1', companyId: 'company-1', journalEntryId: 'je-100' })
    mockPrisma.billPaymentApplication = { findMany: jest.fn().mockResolvedValue([]) }
    mockPrisma.billPayment = { update: jest.fn().mockResolvedValue({ id: 'payment-1', deletedAt: new Date() }) }

    await repo.voidBill('company-1', 'bill-1')

    expect(glIntegration.createReversingJE).toHaveBeenCalledWith(mockPrisma, 'company-1', 'je-100', 'Void bill bill-1')
    expect(mockPrisma.bill.update).toHaveBeenCalledWith({ where: { id: 'bill-1' }, data: { status: 'VOIDED', postingStatus: 'VOIDED', deletedAt: expect.any(Date) } })
  })

  test('recordBillPayment does not post directly to GL in the repository path', async () => {
    await repo.recordBillPayment({
      workspaceId: 'w1',
      companyId: 'company-1',
      billId: 'bill-1',
      amount: 500,
      paymentDate: new Date('2025-01-02'),
      method: 'CASH',
      createdById: 'user-1',
      applications: [{ billId: 'bill-1', amount: 500 }],
    })

    expect(glIntegration.createAndPostJE).not.toHaveBeenCalled()
  })
})
