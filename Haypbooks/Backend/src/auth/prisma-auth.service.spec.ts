import { PrismaAuthService } from './prisma-auth.service'
import { JwtService } from '@nestjs/jwt'

describe('PrismaAuthService (phone normalization)', () => {
  let svc: PrismaAuthService

  const mockUserRepo: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
  const mockSessionRepo: any = { create: jest.fn(), delete: jest.fn(), findByRefreshToken: jest.fn() }
  const mockOtpRepo: any = { create: jest.fn(), findLatestByPhone: jest.fn(), delete: jest.fn() }
  const mockSecurityEventRepo: any = { countRecentByEmail: jest.fn(), create: jest.fn() }
  const mockJwt: any = { sign: jest.fn(() => 'signed-token') } as JwtService

  beforeEach(() => {
    jest.resetAllMocks()
    svc = new PrismaAuthService(mockUserRepo, mockSessionRepo, mockOtpRepo, mockSecurityEventRepo, mockJwt)
  })

  test('signup normalizes messy phone input and stores E.164', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    mockUserRepo.create.mockImplementation((data: any) => Promise.resolve({ id: 'u1', ...data }))

    const resp = await svc.signup('norm@e.test', 'Password1!', 'Norm Name', 'owner', '1 (555) 000-9999')

    expect(mockUserRepo.create).toHaveBeenCalled()
    const passed = mockUserRepo.create.mock.calls[0][0]
    expect(passed.phone).toBe('+15550009999')
    expect(resp.user.email).toBe('norm@e.test')
  })

  test('startOtpByPhone normalizes phone before creating OTP', async () => {
    mockOtpRepo.create.mockImplementation((d: any) => Promise.resolve({ id: 'otp1', ...d }))

    const res = await svc.startOtpByPhone(' (555) 000-9999 ', '777777', 5, 'MFA')

    expect(mockOtpRepo.create).toHaveBeenCalled()
    const createdArgs = mockOtpRepo.create.mock.calls[0][0]
    expect(createdArgs.phone).toBe('+15550009999')
    expect(createdArgs.otpCode).toBeDefined()
    // In non-prod the service returns otp in the response; ensure we get an 'otp' key when NODE_ENV !== 'production'
    if (process.env.NODE_ENV !== 'production') expect((res as any).otp).toBeDefined()
  })
})
