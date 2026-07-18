import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { ArService } from './ar.service'

describe('ArService', () => {
  let service: ArService
  let mockRepo: any
  let mockPrisma: any
  let mockSubLedger: any
  let mockMailService: any
  let mockAuditService: any

  beforeEach(() => {
    mockRepo = {
      sendInvoice: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn() },
      company: { findUnique: jest.fn() },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    }

    mockSubLedger = {
      postInvoiceToGL: jest.fn().mockResolvedValue(undefined),
    }

    mockMailService = {
      buildStatementEmailHtml: jest.fn(),
      buildStatementEmailText: jest.fn(),
      sendEmail: jest.fn().mockResolvedValue(undefined),
    }

    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    }

    service = new ArService(mockRepo as any, mockPrisma as any, mockSubLedger as any, mockMailService as any, mockAuditService as any)
  })

  it('forwards issueInvoice to sendInvoice', async () => {
    const sendSpy = jest.spyOn(service, 'sendInvoice').mockResolvedValue({ id: 'inv-001' } as any)

    const result = await service.issueInvoice('user-1', 'company-1', 'inv-001')

    expect(sendSpy).toHaveBeenCalledWith('user-1', 'company-1', 'inv-001', undefined)
    expect(result).toEqual({ id: 'inv-001' })
  })

  it('posts invoice to GL when sending an invoice', async () => {
    mockPrisma.workspaceUser.findFirst.mockResolvedValue({ id: 'user-1' })
    mockPrisma.company.findUnique.mockResolvedValue({ workspaceId: 'workspace-1' })
    mockRepo.sendInvoice.mockResolvedValue({ id: 'inv-002' })

    const result = await service.sendInvoice('user-1', 'company-1', 'inv-002')

    expect(mockRepo.sendInvoice).toHaveBeenCalledWith('company-1', 'inv-002')
    expect(mockSubLedger.postInvoiceToGL).toHaveBeenCalledWith('inv-002', 'user-1')
    expect(result).toEqual({ id: 'inv-002' })
  })
})
