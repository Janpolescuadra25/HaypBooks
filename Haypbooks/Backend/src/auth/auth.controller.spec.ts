import { AuthController } from './auth.controller'
import { PrismaAuthService } from './prisma-auth.service'
import { MailService } from '../common/mail.service'
import { PendingSignupService } from './pending-signup.service'

describe('AuthController pre-signup/complete-signup', () => {
  let controller: AuthController
  const mockUserRepo: any = { findByEmail: jest.fn(), create: jest.fn(), update: jest.fn() }
  const mockSessionRepo: any = { create: jest.fn() }
  const mockOtpRepo: any = { create: jest.fn(), findLatestByEmail: jest.fn(), delete: jest.fn() }
  const mockSecurityEventRepo: any = { create: jest.fn() }
  const mockMail: any = { sendEmail: jest.fn(), buildVerifyEmailOtpHtml: jest.fn(() => ''), buildVerifyEmailOtpText: jest.fn(() => '') }
  const authSvc: any = {
    startOtp: jest.fn().mockResolvedValue({ otp: '123456' }),
    startOtpByPhone: jest.fn().mockResolvedValue({ otp: '123456' }),
    verifyOtp: jest.fn().mockResolvedValue(true),
    verifyOtpByPhone: jest.fn().mockResolvedValue(true),
    createSessionForUser: jest.fn().mockResolvedValue({ token: 't' }),
  }
  const pending = new PendingSignupService()

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new AuthController(authSvc as any, mockUserRepo as any, mockSessionRepo as any, mockOtpRepo as any, mockSecurityEventRepo as any, mockMail as any, pending)
  })

  test('preSignup creates pending and starts OTP', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    const resp = await controller.preSignup({ email: 'u@e.test', password: 'Pass1!', name: 'U', role: 'owner' })
    expect(resp.signupToken).toBeDefined()
    expect(authSvc.startOtp).toHaveBeenCalled()
  })

  test('completeSignup verifies otp and creates user', async () => {
    // create a pending entry via controller preSignup to avoid directly calling service
    mockUserRepo.findByEmail.mockResolvedValue(null)
    const resp = await controller.preSignup({ email: 'x@e.test', password: 'Pass1!', name: 'X' })
    const token = (resp as any).signupToken

    // simulate verify
    (authSvc.verifyOtp as jest.Mock).mockResolvedValue(true)
    mockUserRepo.create.mockImplementation((d: any) => Promise.resolve({ id: 'new', ...d }))

    // call complete
    const res = await controller.completeSignup({ signupToken: token, code: '123456' }, { cookie: jest.fn() } as any)
    expect(mockUserRepo.create).toHaveBeenCalled()
    const p = await pending.get(token)
    expect(p).toBeNull()
  })

  test('completeSignup fails when another verified user is present and removes pending', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    const resp = await controller.preSignup({ email: 'conflict@e.test', password: 'Pass1!', name: 'C' })
    const token = (resp as any).signupToken

    // now simulate a different flow where a verified user was created concurrently
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing', email: 'conflict@e.test', isEmailVerified: true })

    await expect(controller.completeSignup({ signupToken: token, code: '111111' }, { cookie: jest.fn() } as any)).rejects.toThrowError()
    const p = await pending.get(token)
    expect(p).toBeNull()
  })

  test('signup routes to preSignup when ENFORCE_PRE_SIGNUP is true', async () => {
    process.env.ENFORCE_PRE_SIGNUP = 'true'
    mockUserRepo.findByEmail.mockResolvedValue(null)
    mockUserRepo.create.mockClear()

    const resp = await controller.signup({ email: 'enf@e.test', password: 'Pass1!', name: 'E' } as any, { cookie: jest.fn() } as any)
    expect((resp as any).signupToken).toBeDefined()
    // Ensure no DB user was created
    expect(mockUserRepo.create).not.toHaveBeenCalled()
    // Cleanup
    delete process.env.ENFORCE_PRE_SIGNUP
  })
})