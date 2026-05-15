import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ApService } from '../../../src/ap/ap.service'

describe('ApService - Approval Workflow Rules', () => {
  let mockRepo: any
  let mockPrisma: any
  let mockSubLedger: any
  let service: ApService

  beforeEach(() => {
    jest.resetAllMocks()

    mockRepo = {
      findBillById: jest.fn(),
      deleteBill: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }) },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w1' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      approvalWorkflow: { findFirst: jest.fn().mockResolvedValue(null) },
      approvalRequest: { create: jest.fn().mockResolvedValue({}), updateMany: jest.fn().mockResolvedValue({}) },
      bill: { update: jest.fn().mockResolvedValue({ id: 'bill-1', status: 'PENDING' }) },
      $transaction: jest.fn(async (work: any) => (typeof work === 'function' ? await work(mockPrisma) : work)),
    }

    mockSubLedger = {
      postBillToGL: jest.fn().mockResolvedValue(undefined),
      postBillReversalToGL: jest.fn().mockResolvedValue(undefined),
    }

    service = new ApService(mockRepo as any, mockPrisma as any, mockSubLedger as any)
  })

  test('submit creates PENDING status and does not post to GL', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', workspaceId: 'w1', status: 'DRAFT' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'PENDING' })

    const result = await service.submitBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('PENDING')
    expect(mockSubLedger.postBillToGL).not.toHaveBeenCalled()
  })

  test('approve creates GL entries via SubLedger', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', workspaceId: 'w1', status: 'PENDING', billNumber: 'BILL-001' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'APPROVED', postingStatus: 'POSTED' })

    const result = await service.approveBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('APPROVED')
    expect(mockSubLedger.postBillToGL).toHaveBeenCalledTimes(1)
  })

  test('unapprove reverses GL entries and returns the bill to DRAFT', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', workspaceId: 'w1', status: 'APPROVED' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'DRAFT' })

    const result = await service.unapproveBill('user-1', 'company-1', 'bill-1')

    expect(result.status).toBe('DRAFT')
    expect(mockSubLedger.postBillReversalToGL).toHaveBeenCalledWith('bill-1', 'user-1')
  })

  test('reject does not create GL entries', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'PENDING', workspaceId: 'w1' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'REJECTED' })

    const result = await service.rejectBill('user-1', 'company-1', 'bill-1', 'Budget capped')

    expect(result.status).toBe('REJECTED')
    expect(mockSubLedger.postBillToGL).not.toHaveBeenCalled()
  })

  test('resubmit after reject works and only creates GL on approve', async () => {
    mockRepo.findBillById
      .mockResolvedValueOnce({ id: 'bill-1', companyId: 'company-1', status: 'REJECTED', workspaceId: 'w1' })
      .mockResolvedValueOnce({ id: 'bill-1', companyId: 'company-1', status: 'PENDING', workspaceId: 'w1', billNumber: 'BILL-001' })
    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'PENDING' })

    const submitResult = await service.submitBill('user-1', 'company-1', 'bill-1')
    expect(submitResult.status).toBe('PENDING')

    mockPrisma.bill.update.mockResolvedValue({ id: 'bill-1', status: 'APPROVED', postingStatus: 'POSTED' })
    const approveResult = await service.approveBill('user-1', 'company-1', 'bill-1')

    expect(approveResult.status).toBe('APPROVED')
    expect(mockSubLedger.postBillToGL).toHaveBeenCalledTimes(1)
  })

  test('only draft bills can be deleted in current service implementation', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'DRAFT', workspaceId: 'w1' })
    mockRepo.deleteBill.mockResolvedValue({ id: 'bill-1' })

    const result = await service.deleteBill('user-1', 'company-1', 'bill-1')
    expect(result).toEqual({ id: 'bill-1' })
  })

  test('rejecting a non-pending bill throws', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'APPROVED', workspaceId: 'w1' })
    await expect(service.rejectBill('user-1', 'company-1', 'bill-1', 'nope')).rejects.toThrow(BadRequestException)
  })

  test('deleting a rejected bill is not permitted by current service implementation', async () => {
    mockRepo.findBillById.mockResolvedValue({ id: 'bill-1', companyId: 'company-1', status: 'REJECTED', workspaceId: 'w1' })
    await expect(service.deleteBill('user-1', 'company-1', 'bill-1')).rejects.toThrow(BadRequestException)
  })
})
