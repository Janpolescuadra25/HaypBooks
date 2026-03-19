import { OnboardingService } from './onboarding.service'
import { BadRequestException } from '@nestjs/common'
import * as metrics from '../common/metrics'

describe('OnboardingService', () => {
  function makeSut({ steps = {}, user = null }: any) {
    const onboardingRepo = {
      load: jest.fn().mockResolvedValue(steps),
      save: jest.fn().mockResolvedValue(undefined),
      markComplete: jest.fn().mockResolvedValue(undefined),
      isComplete: jest.fn().mockResolvedValue(false),
    }
    const userRepo = {
      findById: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue((id: string, data: any) => ({ id, ...data })),
    }
    const companySvc = { createCompany: jest.fn().mockResolvedValue({ id: 't1', name: 'ACME' }) }
    const prismaMock: any = {
      $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
      workspace: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'w1' }),
      },
      company: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'c1' }),
      },
      country: { findFirst: jest.fn().mockResolvedValue(null) },
      practice: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'p1' }) },
    }
    const accountingSvc = { seedDefaultAccounts: jest.fn().mockResolvedValue(undefined) } as any
    const svc = new OnboardingService(onboardingRepo as any, userRepo as any, companySvc as any, accountingSvc, prismaMock as any)
    return { svc, onboardingRepo, userRepo, companySvc, prismaMock, accountingSvc }
  }

  test('completes OWNER onboarding with businessName provided and transaction-safe operations', async () => {
    const { svc, prismaMock } = makeSut({ steps: { business: { businessName: 'ACME' } }, user: { id: 'u1' } })
    await expect(svc.complete('u1', 'full', 'OWNER')).resolves.toEqual({ success: true, company: { id: 'c1' } })
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  test('completes OWNER onboarding when workspaceName provided in steps', async () => {
    const { svc, onboardingRepo, userRepo, prismaMock } = makeSut({ steps: { business: { workspaceName: '  ACME  ' } }, user: { id: 'u2' } })
    await expect(svc.complete('u2', 'full', 'OWNER')).resolves.toEqual({ success: true, company: { id: 'c1' } })
    // When workspaceName is provided we should NOT persist companyName on the user profile
    expect(userRepo.update).not.toHaveBeenCalledWith('u2', expect.objectContaining({ companyName: 'ACME' }))
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u2')
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  test('throws when completing ACCOUNTANT onboarding without firmName', async () => {
    const { svc } = makeSut({ steps: {}, user: { id: 'u3' } })
    await expect(svc.complete('u3', 'full', 'ACCOUNTANT')).rejects.toThrow(BadRequestException)
  })

  test('completes ACCOUNTANT onboarding when firmName provided in steps', async () => {
    const { svc, onboardingRepo, prismaMock } = makeSut({ steps: { accountant_firm: { firmName: 'Trust LLP' } }, user: { id: 'u4' } })
    await expect(svc.complete('u4', 'full', 'ACCOUNTANT')).resolves.toEqual({ success: true, company: { id: 'w1' } })
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u4')
    // accountant path should not call workspace transaction
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  test('ensures practice row is created when accountant tenant already exists', async () => {
    // simulate existing tenant by having companySvc.createCompany not called and tenantService returning an id
    const { svc, companySvc, onboardingRepo, prismaMock } = makeSut({ steps: { accountant_firm: { firmName: 'FirmX' } }, user: { id: 'u5' } })
    // mock tenantsService to return an existing practice tenant
    ;(svc as any)['tenantsService'] = { listTenantsForUser: jest.fn().mockResolvedValue([{ id: 't-practice', type: 'PRACTICE' }]), updateWorkspaceName: jest.fn().mockResolvedValue(null), updateFirmName: jest.fn().mockResolvedValue(null) }
    // spy on prisma.practice.create
    const practiceSpy = jest.spyOn(prismaMock.practice, 'findFirst').mockResolvedValue(null as any)
    const createSpy = jest.spyOn(prismaMock.practice, 'create').mockResolvedValue({ id: 'p1', name: 'FirmX', workspaceId: 't-practice' } as any)

    await expect(svc.complete('u5', 'full', 'ACCOUNTANT')).resolves.toEqual({ success: true, company: { id: 'w1' } })
    expect(createSpy).toHaveBeenCalled()
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u5')
    practiceSpy.mockRestore()
    createSpy.mockRestore()
  })

  test('increments metric when company creation / transaction fails and onboarding is aborted', async () => {
    const { svc, onboardingRepo, prismaMock } = makeSut({ steps: { business: { companyName: 'ACME' } }, user: { id: 'u6' } })
    prismaMock.$transaction.mockRejectedValueOnce(new Error('db down'))
    const spy = jest.spyOn(metrics, 'increment')
    metrics.resetCounts()

    await expect(svc.complete('u6', 'full', 'OWNER')).rejects.toThrow('db down')
    expect(onboardingRepo.markComplete).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith('onboarding.company_creation_failure')
    spy.mockRestore()
  })

  test('transaction failure results in error and no completion marker', async () => {
    const { svc, onboardingRepo, prismaMock } = makeSut({ steps: { business: { companyName: 'ACME' } }, user: { id: 'u7' } })
    prismaMock.$transaction.mockRejectedValueOnce(new Error('tx fail'))
    await expect(svc.complete('u7', 'full', 'OWNER')).rejects.toThrow('tx fail')
    expect(onboardingRepo.markComplete).not.toHaveBeenCalled()
  })
})
