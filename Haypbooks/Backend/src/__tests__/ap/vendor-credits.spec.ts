import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ApService } from '../../../src/ap/ap.service'

describe('ApService - Vendor Credits', () => {
  let mockRepo: any
  let mockPrisma: any
  let mockSubLedger: any
  let service: ApService

  beforeEach(() => {
    jest.resetAllMocks()

    mockRepo = {
      findVendorCreditById: jest.fn(),
      createVendorCredit: jest.fn(),
      updateVendorCredit: jest.fn(),
      deleteVendorCredit: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }) },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w1' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn(async (work: any) => (typeof work === 'function' ? await work(mockPrisma) : work)),
      vendorCredit: { update: jest.fn().mockResolvedValue({ id: 'credit-1', status: 'APPLIED' }) },
    }

    mockSubLedger = {
      postVendorCreditToGL: jest.fn().mockResolvedValue(undefined),
    }

    service = new ApService(mockRepo as any, mockPrisma as any, mockSubLedger as any)
  })

  test('creates a vendor credit with correct total and vendor', async () => {
    const payload = { vendorId: 'vendor-1', lines: [{ accountId: 'acc-1', amount: 300 }], creditNumber: 'CR-001' }
    mockRepo.createVendorCredit.mockResolvedValue({ id: 'credit-1', vendorId: 'vendor-1', total: 300, balance: 300, status: 'DRAFT' })

    const result = await service.createVendorCredit('user-1', 'company-1', payload)

    expect(result.vendorId).toBe('vendor-1')
    expect(result.total).toBe(300)
    expect(result.balance).toBe(300)
    expect(mockRepo.createVendorCredit).toHaveBeenCalledWith(expect.objectContaining({ vendorId: 'vendor-1', total: 300 }))
  })

  test('applies a vendor credit and posts it to GL in a transaction', async () => {
    mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', status: 'DRAFT' })
    mockPrisma.vendorCredit.update.mockResolvedValue({ id: 'credit-1', status: 'APPLIED', postingStatus: 'POSTED' })

    const result = await service.applyVendorCredit('user-1', 'company-1', 'credit-1')

    expect(mockSubLedger.postVendorCreditToGL).toHaveBeenCalledWith('credit-1', 'user-1', mockPrisma)
    expect(mockPrisma.vendorCredit.update).toHaveBeenCalledWith({ where: { id: 'credit-1' }, data: { status: 'APPLIED', postingStatus: 'POSTED' } })
    expect(result.status).toBe('APPLIED')
    expect(result.postingStatus).toBe('POSTED')
  })

  test('does not apply an already applied credit', async () => {
    mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', status: 'APPLIED' })

    await expect(service.applyVendorCredit('user-1', 'company-1', 'credit-1')).rejects.toThrow(BadRequestException)
  })

  test('deletes an unposted vendor credit', async () => {
    mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', postingStatus: 'DRAFT' })
    mockRepo.deleteVendorCredit.mockResolvedValue({ id: 'credit-1' })

    const result = await service.deleteVendorCredit('user-1', 'company-1', 'credit-1')

    expect(mockRepo.deleteVendorCredit).toHaveBeenCalledWith('company-1', 'credit-1')
    expect(result).toEqual({ id: 'credit-1' })
  })

  test('rejects deletion of a posted vendor credit', async () => {
    mockRepo.findVendorCreditById.mockResolvedValue({ id: 'credit-1', companyId: 'company-1', postingStatus: 'POSTED' })

    await expect(service.deleteVendorCredit('user-1', 'company-1', 'credit-1')).rejects.toThrow(BadRequestException)
    expect(mockRepo.deleteVendorCredit).not.toHaveBeenCalled()
  })

  test('creates vendor credit inside the transaction flow by default', async () => {
    const payload = { vendorId: 'vendor-1', lines: [{ accountId: 'acc-1', amount: 300 }] }
    mockRepo.createVendorCredit.mockResolvedValue({ id: 'credit-1', vendorId: 'vendor-1', total: 300, balance: 300, status: 'DRAFT' })

    await service.createVendorCredit('user-1', 'company-1', payload)

    expect(mockRepo.createVendorCredit).toHaveBeenCalled()
  })

  test.todo('applies vendor credit to a bill and reduces amount due when that functionality is implemented')
  test.todo('voids a vendor credit and reverses GL entries when a void flow is available')
})
