import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PayrollService } from './payroll.service'

describe('PayrollService voidPayrollRun', () => {
  let service: PayrollService
  let mockPrisma: any
  let mockSubLedger: any
  let tx: any

  beforeEach(() => {
    jest.resetAllMocks()

    tx = {
      payrollRun: {
        update: jest.fn(),
      },
      paycheck: {
        updateMany: jest.fn(),
      },
    }

    mockPrisma = {
      payrollRun: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(async (fn: any) => fn(tx)),
    }

    mockSubLedger = {
      reversePayrollRunFromGL: jest.fn().mockResolvedValue('je-reversal-1'),
    }

    service = new PayrollService({} as any, mockPrisma as any, mockSubLedger as any)
    ;(service as any).assertAccess = jest.fn().mockResolvedValue(undefined)
  })

  it('should successfully void a POSTED payroll run, reverse GL entry, and soft-delete paychecks', async () => {
    const run = {
      id: 'run-1',
      companyId: 'company-1',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-01-15T00:00:00.000Z'),
      status: 'POSTED',
      journalEntryId: 'je-123',
    }

    mockPrisma.payrollRun.findFirst.mockResolvedValue(run)
    tx.payrollRun.update.mockResolvedValue({ ...run, status: 'VOID', postingStatus: 'VOIDED', deletedAt: new Date() })
    tx.paycheck.updateMany.mockResolvedValue({ count: 2 })

    const result = await service.voidPayrollRun('company-1', 'run-1', 'Corrupt payroll run', 'user-1')

    expect((service as any).assertAccess).toHaveBeenCalledWith('user-1', 'company-1')
    expect(mockSubLedger.reversePayrollRunFromGL).toHaveBeenCalledWith(
      tx,
      'company-1',
      'je-123',
      'Corrupt payroll run',
      expect.any(Date),
    )
    expect(tx.payrollRun.update).toHaveBeenCalledWith({
      where: { id: 'run-1' },
      data: {
        status: 'VOID',
        postingStatus: 'VOIDED',
        deletedAt: expect.any(Date),
      },
    })
    expect(tx.paycheck.updateMany).toHaveBeenCalledWith({
      where: { payrollRunId: 'run-1', companyId: 'company-1' },
      data: { deletedAt: expect.any(Date) },
    })
    expect(result).toEqual({ ...run, status: 'VOID', postingStatus: 'VOIDED', deletedAt: expect.any(Date) })
  })

  it.each(['DRAFT', 'VOID'])('should throw BadRequestException if run status is %s', async (status) => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue({
      id: 'run-1',
      companyId: 'company-1',
      status,
      startDate: new Date(),
      endDate: new Date(),
      journalEntryId: null,
    })

    await expect(service.voidPayrollRun('company-1', 'run-1', undefined, 'user-1')).rejects.toThrow(
      new BadRequestException('Only POSTED payroll runs can be voided'),
    )
  })

  it('should throw NotFoundException if run does not exist for the company', async () => {
    mockPrisma.payrollRun.findFirst.mockResolvedValue(null)

    await expect(service.voidPayrollRun('company-1', 'run-1', undefined, 'user-1')).rejects.toThrow(
      new NotFoundException('Payroll run not found'),
    )
  })
})
