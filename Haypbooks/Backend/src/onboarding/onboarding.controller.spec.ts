import { OnboardingController } from './onboarding.controller'

describe('OnboardingController', () => {
  test('complete returns company when onboarding service creates a tenant and sets cookies', async () => {
    const fakeCompany = { id: 't-demo', name: 'DemoCo' }
    const onboardingSvc = { complete: jest.fn().mockResolvedValue({ success: true, company: fakeCompany }) }
    const controller = new OnboardingController(onboardingSvc as any)

    const cookieSpies: any = []
    const res: any = {
      cookie: jest.fn((name: string, value: any, opts: any) => { cookieSpies.push({ name, value, opts }) })
    }
    const req: any = { user: { userId: 'u1' } }

    const result = await controller.complete(req, res, { type: 'full', hub: 'OWNER' })
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.company).toEqual(fakeCompany)

    // cookies set
    expect(res.cookie).toHaveBeenCalled()
    expect(cookieSpies.some((c: any) => c.name === 'onboardingOwnerComplete')).toBe(true)
    expect(cookieSpies.some((c: any) => c.name === 'onboardingComplete')).toBe(true)
    expect(cookieSpies.some((c: any) => c.name === 'onboardingMode')).toBe(true)
    // Service called with expected args
    expect(onboardingSvc.complete).toHaveBeenCalledWith('u1', 'full', 'OWNER')
  })
})
