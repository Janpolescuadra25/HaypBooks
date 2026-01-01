import { AuthService } from './auth.service'
import { ConflictException } from '@nestjs/common'

describe('AuthService.signup', () => {
  let authService: AuthService
  const mockUserRepo: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
  const mockJwt: any = { sign: jest.fn(() => 'signed-token') }

  beforeEach(() => {
    jest.resetAllMocks()
    authService = new AuthService(mockUserRepo, mockJwt)
  })

  test('creates an accountant user with preferredHub ACCOUNTANT and isAccountant true', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    mockUserRepo.create.mockImplementation((data: any) => Promise.resolve({ id: 'u1', ...data }))

    const resp = await authService.signup({ email: 'a@b.com', name: 'Acct', password: 'Pass1!', role: 'accountant', phone: '+1 555 000 0000' } as any)

    expect(mockUserRepo.create).toHaveBeenCalled()
    const passed = mockUserRepo.create.mock.calls[0][0]
    expect(passed.role).toBe('accountant')
    expect(passed.isAccountant).toBeTruthy()
    expect(passed.preferredHub).toBe('ACCOUNTANT')
    expect(passed.phone).toBe('+1 555 000 0000')
    expect(resp.user.email).toBe('a@b.com')
  })

  test('throws ConflictException when email already exists and is verified', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', isEmailVerified: true })

    await expect(authService.signup({ email: 'a@b.com', name: 'X', password: 'pass' } as any)).rejects.toThrow(ConflictException)
  })

  test('updates existing unverified user instead of creating a duplicate', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', isEmailVerified: false })
    mockUserRepo.update.mockImplementation((id: string, data: any) => Promise.resolve({ id, email: 'a@b.com', ...data }))

    const resp = await authService.signup({ email: 'a@b.com', name: 'X', password: 'pass', phone: '+1 555 000 0000' } as any)
    expect(mockUserRepo.update).toHaveBeenCalled()
    expect(resp.user.email).toBe('a@b.com')
  })
})