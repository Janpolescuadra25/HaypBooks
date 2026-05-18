import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ApService } from '../../../src/ap/ap.service'

describe('ApService - Bill Lifecycle', () => {
  let mockRepo: any
  let mockPrisma: any
  let mockSubLedger: any
  let service: ApService

  beforeEach(() => {
    jest.resetAllMocks()

    mockRepo = {
      createBill: jest.fn(),
      findBillById: jest.fn(),
      recordBillPayment: jest.fn(),
      updateBillPayment: jest.fn(),
      voidBill: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }) },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w1' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      approvalWorkflow: { findFirst: jest.fn().mockResolvedValue(null) },
      approvalRequest: { create: jest.fn(), updateMany: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn(async (work: any) => (typeof work === 'function' ? await work(mockPrisma) : work)),
      bill: { update: jest.fn().mockResolvedValue({ id: 'bill1', status: 'PENDING' }) },
    }

    mockSubLedger = {
      postBillToGL: jest.fn().mockResolvedValue(undefined),
      postBillReversalToGL: jest.fn().mockResolvedValue(undefined),
      postBillPaymentToGL: jest.fn().mockResolvedValue(undefined),
    }

    service = new ApService(mockRepo as any, mockPrisma as any, mockSubLedger as any)
  })

  test('creates a bill as DRAFT with correct vendor, line items, and total', async () => {
    const billPayload = {
      vendorId: 'vendor-1',
      lines: [{ description: 'Office supplies', accountId: 'acc-1', quantity: 1, rate: 1000, amount: 1000 }],
    }
    mockRepo.createBill.mockResolvedValue({
      id: 'bill-1',
      status: 'DRAFT',
      total: 1000,
      vendorId: 'vendor-1',
      lines: billPayload.lines,
      balance: 1000,
    })

    const result = await service.createBill('user-1', 'company-1', billPayload)

    expect(result.status).toBe('DRAFT')
    expect(result.vendorId).toBe('vendor-1')
    expect(result.total).toBe(1000)
    expect(result.items).toHaveLength(1)
    expect(mockRepo.createBill).toHaveBeenCalledWith(expect.objectContaining({ companyId: 'company-1', vendorId: 'vendor-1' }))
  })

  test('submits a draft bill to PENDING', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', workspaceId: 'w1', status: 'DRAFT' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'PENDING' })

    const result = await service.submitBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('PENDING')
    expect(mockPrisma.bill.update).toHaveBeenCalledWith({ where: { id: 'bill-1' }, data: { status: 'PENDING', rejectionReason: null } })
  })

  test('approves a pending bill and posts it to GL', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', workspaceId: 'w1', status: 'PENDING', billNumber: 'BILL-001' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'APPROVED', postingStatus: 'POSTED' })

    const result = await service.approveBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('APPROVED')
    expect(mockSubLedger.postBillToGL).toHaveBeenCalledWith('bill-1', 'user-1', mockPrisma)
  })

  test('records a full payment for an approved bill and posts it to GL', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'APPROVED', balance: 1000 })
    mockRepo.recordBillPayment.mockResolvedValue({ id: 'payment-1', billId: 'bill-1' })
    mockRepo.updateBillPayment.mockResolvedValue({ id: 'payment-1', billId: 'bill-1', journalEntryId: 'je-1', postingStatus: 'POSTED' })

    const result = await service.recordPayment('user-1', 'company-1', 'bill-1', { amount: 1000 })

    expect(result.id).toBe('payment-1')
    expect(result.billId).toBe('bill-1')
    expect(result.journalEntryId).toBe('je-1')
    expect(result.postingStatus).toBe('POSTED')
    expect(mockRepo.recordBillPayment).toHaveBeenCalledWith(expect.objectContaining({ billId: 'bill-1', amount: 1000, applications: [{ billId: 'bill-1', amount: 1000 }] }))
    expect(mockSubLedger.postBillPaymentToGL).toHaveBeenCalledWith('payment-1', 'user-1')
    expect(mockRepo.updateBillPayment).toHaveBeenCalledWith('payment-1', { postingStatus: 'POSTED' })
  })

  test('rejects a pending bill with a reason', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'PENDING', workspaceId: 'w1' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'REJECTED', rejectionReason: 'Budget exceeded' })

    const result = await service.rejectBill('user-1', 'company-1', 'bill-1', 'Budget exceeded')

    expect(result.status).toBe('REJECTED')
    expect(result.rejectionReason).toBe('Budget exceeded')
  })

  test('resubmits a rejected bill back to PENDING', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', workspaceId: 'w1', status: 'REJECTED' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'PENDING' })

    const result = await service.submitBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('PENDING')
  })

  test('voids a bill and delegates to repository voidBill', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'DRAFT', total: 1000, balance: 1000 })
    mockRepo.voidBill.mockResolvedValue({ id: 'bill-1', status: 'VOIDED' })

    const result = await service.voidBill('user-1', 'company-1', 'bill-1')

    expect(result).not.toBeNull()
    expect(result?.status).toBe('VOIDED')
    expect(mockRepo.voidBill).toHaveBeenCalledWith('company-1', 'bill-1', { userId: 'user-1', workspaceId: 'w1' })
  })

  test('prevents paying a PENDING bill', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'PENDING', balance: 1000 })

    await expect(service.recordPayment('user-1', 'company-1', 'bill-1', { amount: 1000 })).rejects.toThrow(BadRequestException)
  })

  test('prevents submitting a PAID bill', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'PAID', workspaceId: 'w1' })

    await expect(service.submitBill('user-1', 'company-1', 'bill-1')).rejects.toThrow(BadRequestException)
  })

  test('prevents rejecting a PAID bill', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'PAID', workspaceId: 'w1' })

    await expect(service.rejectBill('user-1', 'company-1', 'bill-1', 'Too late')).rejects.toThrow(BadRequestException)
  })

  test.todo('cannot approve a DRAFT bill directly when workflow requires PENDING first')
})
