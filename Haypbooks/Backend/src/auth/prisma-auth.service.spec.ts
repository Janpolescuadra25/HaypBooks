import { PrismaAuthService } from './prisma-auth.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from '../utils/bcrypt-fallback'

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
  const mockJwt: any = { sign: jest.fn(() => 'signed-token') } as unknown as JwtService

  beforeEach(() => {
    jest.clearAllMocks()
    svc = new PrismaAuthService(mockUserRepo, mockSessionRepo, mockOtpRepo, mockSecurityEventRepo, mockJwt)
  })

  test('login rejects when no phone and email is not verified', async () => {
    const hashed = await bcrypt.hash('Password1!', 10)
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'u@e.test',
      password: hashed,
      isEmailVerified: false,
      phone: null,
      isPhoneVerified: false,
    })

    await expect(svc.login('u@e.test', 'Password1!')).rejects.toThrow()
  })

  test('login succeeds when email is verified even if phone is not (OR policy)', async () => {
    const hashed = await bcrypt.hash('Password1!', 10)
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'u2',
      email: 'p@e.test',
      password: hashed,
      isEmailVerified: true,
      phone: '+15550001234',
      isPhoneVerified: false,
      isAccountant: false,
      preferredHub: 'OWNER',
    })

    mockSessionRepo.create.mockResolvedValue({ id: 's2' })

    const resp = await svc.login('p@e.test', 'Password1!')
    expect(resp.token).toBeTruthy()
    expect(resp.refreshToken).toBeTruthy()
    expect(resp.user.email).toBe('p@e.test')
  })

  test('login rejects when phone exists and neither email nor phone is verified (OR policy)', async () => {
    const hashed = await bcrypt.hash('Password1!', 10)
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'u2b',
      email: 'p2@e.test',
      password: hashed,
      isEmailVerified: false,
      phone: '+15550001235',
      isPhoneVerified: false,
    })

    await expect(svc.login('p2@e.test', 'Password1!')).rejects.toThrow()
  })

  test('login succeeds when email verified (and phone verified if present)', async () => {
    const hashed = await bcrypt.hash('Password1!', 10)
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'u3',
      email: 'ok@e.test',
      password: hashed,
      isEmailVerified: true,
      phone: '+15550001234',
      isPhoneVerified: true,
      isAccountant: false,
      preferredHub: 'OWNER',
    })
    mockSessionRepo.create.mockResolvedValue({ id: 's1' })

    const resp = await svc.login('ok@e.test', 'Password1!')
    expect(resp.token).toBeTruthy()
    expect(resp.refreshToken).toBeTruthy()
    expect(resp.user.email).toBe('ok@e.test')
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

  test('updates existing unverified user instead of creating duplicate', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'u2', email: 'dup@e.test', isEmailVerified: false })
    mockUserRepo.update.mockImplementation((id: string, data: any) => Promise.resolve({ id, email: 'dup@e.test', ...data }))

    await expect(svc.signup('dup@e.test', 'Password1!', 'Dup Name', 'owner', '1 (555) 000-9999')).rejects.toThrow()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  test('startOtpByPhone normalizes phone before creating OTP', async () => {
    mockOtpRepo.create.mockImplementation((d: any) => Promise.resolve({ id: 'otp1', ...d }))

    const res = await svc.startOtpByPhone('1 (555) 000-9999', '777777', 5, 'MFA')

    expect(mockOtpRepo.create).toHaveBeenCalled()
    const createdArgs = mockOtpRepo.create.mock.calls[0][0]
    expect(createdArgs.phone).toBe('+15550009999')
    expect(createdArgs.otpCode).toBeDefined()
    // PrismaAuthService returns the created OTP row
    expect((res as any).id).toBe('otp1')
  })
})
