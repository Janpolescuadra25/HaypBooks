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
    const svc = new OnboardingService(onboardingRepo as any, userRepo as any, companySvc as any)
    return { svc, onboardingRepo, userRepo, companySvc }
  }

  test('throws when completing OWNER onboarding without companyName present', async () => {
    const { svc } = makeSut({ steps: {}, user: { id: 'u1' } })
    await expect(svc.complete('u1', 'full', 'OWNER')).rejects.toThrow(BadRequestException)
  })

  test('completes OWNER onboarding when companyName provided in steps', async () => {
    const { svc, onboardingRepo, userRepo, companySvc } = makeSut({ steps: { business: { companyName: '  ACME  ' } }, user: { id: 'u2' } })
    await expect(svc.complete('u2', 'full', 'OWNER')).resolves.toEqual({ success: true, company: { id: 't1', name: 'ACME' } })
    expect(userRepo.update).toHaveBeenCalledWith('u2', expect.objectContaining({ companyName: 'ACME' }))
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u2')
    // Company creation should be attempted and include a nested users.create with the owner userId
    expect(companySvc.createCompany).toHaveBeenCalled()
    const payload = (companySvc.createCompany as jest.Mock).mock.calls[0][0]
    expect(payload.name).toBe('ACME')
    expect(payload.users).toBeDefined()
    expect(payload.users.create).toBeInstanceOf(Array)
    expect(payload.users.create[0]).toEqual(expect.objectContaining({ userId: 'u2', isOwner: true }))
  })

  test('throws when completing ACCOUNTANT onboarding without firmName', async () => {
    const { svc } = makeSut({ steps: {}, user: { id: 'u3' } })
    await expect(svc.complete('u3', 'full', 'ACCOUNTANT')).rejects.toThrow(BadRequestException)
  })

  test('completes ACCOUNTANT onboarding when firmName provided in profile', async () => {
    const { svc, onboardingRepo, userRepo } = makeSut({ steps: {}, user: { id: 'u4', firmName: 'Trust LLP' } })
    await expect(svc.complete('u4', 'full', 'ACCOUNTANT')).resolves.toEqual({ success: true, company: null })
    expect(userRepo.update).toHaveBeenCalledWith('u4', expect.objectContaining({ firmName: 'Trust LLP' }))
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u4')
  })

  test('increments metric when company creation fails but onboarding still completes', async () => {
    const { svc, onboardingRepo, userRepo, companySvc } = makeSut({ steps: { business: { companyName: 'ACME' } }, user: { id: 'u6' } })
    // Simulate createCompany throwing at runtime
    ;(companySvc.createCompany as jest.Mock).mockRejectedValueOnce(new Error('db down'))
    const spy = jest.spyOn(metrics, 'increment')
    metrics.resetCounts()

    await expect(svc.complete('u6', 'full', 'OWNER')).resolves.toEqual({ success: true, company: null })
    expect(onboardingRepo.markComplete).toHaveBeenCalledWith('u6')
    expect(spy).toHaveBeenCalledWith('onboarding.company_creation_failure')
    spy.mockRestore()
  })
})
