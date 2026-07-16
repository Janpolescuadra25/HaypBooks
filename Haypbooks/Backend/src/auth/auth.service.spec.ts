import { PrismaAuthService } from './prisma-auth.service'
import { ConflictException } from '@nestjs/common'

describe('PrismaAuthService.signup', () => {
  let authService: PrismaAuthService
  const mockUserRepo: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
  const mockSessionRepo: any = {}
  const mockOtpRepo: any = {}
  const mockSecurityEventRepo: any = { create: jest.fn() }
  const mockJwt: any = { sign: jest.fn(() => 'signed-token') }

  beforeEach(() => {
    jest.resetAllMocks()
    authService = new PrismaAuthService(mockUserRepo, mockSessionRepo, mockOtpRepo, mockSecurityEventRepo, mockJwt)
  })

  test('creates an accountant user with preferredHub ACCOUNTANT and isAccountant true', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    mockUserRepo.create.mockImplementation((data: any) => Promise.resolve({ id: 'u1', ...data }))

    const resp = await authService.signup('a@b.com', 'Pass1!', 'Acct', 'accountant', '+1 555 000 0000')

    expect(mockUserRepo.create).toHaveBeenCalled()
    const passed = mockUserRepo.create.mock.calls[0][0]
    expect(passed.role).toBe('accountant')
    expect(passed.isAccountant).toBeTruthy()
    expect(passed.preferredHub).toBe('ACCOUNTANT')
    expect(passed.phone).toBe('+15550000000')
    expect(resp.user.email).toBe('a@b.com')
  })

  test('throws ConflictException when email already exists and is verified', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', isEmailVerified: true })

    await expect(authService.signup('a@b.com', 'pass', 'X')).rejects.toThrow(ConflictException)
  })

  test('throws ConflictException when email already exists (even if unverified)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', isEmailVerified: false })

    await expect(authService.signup('a@b.com', 'pass', 'X', undefined, '+1 555 000 0000')).rejects.toThrow(ConflictException)
    expect(mockUserRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })
})