// Avoid native bcrypt loading in unit tests by mocking it early
jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('h'), compare: jest.fn().mockResolvedValue(true) }))

import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../src/auth/auth.controller'
import { PrismaAuthService } from '../src/auth/prisma-auth.service'
import { MailService } from '../src/common/mail.service'
import { PendingSignupService } from '../src/auth/pending-signup.service'

describe('AuthController (unit)', () => {
  let controller: AuthController
  const mockAuthService = { refresh: jest.fn(), login: jest.fn() }
  const mockUserRepo = {}
  const mockSessionRepo = { findByRefreshToken: jest.fn(), delete: jest.fn() }
  const mockOtpRepo = {}
  const mockSecurityEventRepo = { create: jest.fn() }
  const mockMail = {}
  const mockPending = {}

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: PrismaAuthService, useValue: mockAuthService },
        { provide: 'USER_REPOSITORY', useValue: mockUserRepo },
        { provide: 'SESSION_REPOSITORY', useValue: mockSessionRepo },
        { provide: 'OTP_REPOSITORY', useValue: mockOtpRepo },
        { provide: 'SECURITY_EVENT_REPOSITORY', useValue: mockSecurityEventRepo },
        { provide: MailService, useValue: {} },
        { provide: PendingSignupService, useValue: {} },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('uses req.cookies.refreshToken when present and sets cookies on success', async () => {
    const req: any = { cookies: { refreshToken: 't-from-cookie' }, headers: {}, ip: '127.0.0.1' }
    const res: any = { cookie: jest.fn(), clearCookie: jest.fn() }

    mockAuthService.refresh.mockResolvedValue({ token: 'new-token', refreshToken: 'rotated', user: { id: 'u1' } })

    const result = await controller.refresh(req, res)

    expect(result).toHaveProperty('token', 'new-token')
    expect(res.cookie).toHaveBeenCalledWith('token', 'new-token', expect.any(Object))
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'rotated', expect.any(Object))
  })

  it('falls back to parsing raw Cookie header when req.cookies absent', async () => {
    const req: any = { headers: { cookie: 'refreshToken=header-token; Path=/' }, ip: '127.0.0.1' }
    const res: any = { cookie: jest.fn(), clearCookie: jest.fn() }

    mockAuthService.refresh.mockResolvedValue({ token: 'hdr-token', refreshToken: 'hdr-rotated', user: { id: 'u2' } })

    const result = await controller.refresh(req, res)

    expect(result).toHaveProperty('token', 'hdr-token')
    expect(res.cookie).toHaveBeenCalledWith('token', 'hdr-token', expect.any(Object))
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'hdr-rotated', expect.any(Object))
  })

  it('throws UnauthorizedException when no token present anywhere', async () => {
    const req: any = { headers: {}, ip: '127.0.0.1' }
    const res: any = { cookie: jest.fn(), clearCookie: jest.fn() }

    await expect(controller.refresh(req, res)).rejects.toThrow()
  })

  it('login sets cookies and returns expected shape', async () => {
    const req: any = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' }
    const res: any = { cookie: jest.fn(), clearCookie: jest.fn() }
    const loginDto = { email: 'x@e.com', password: 'pass' }

    mockAuthService.login.mockResolvedValue({ token: 'tok', refreshToken: 'ref', user: { id: 'u', email: 'x@e.com', role: 'owner' } })

    const result = await controller.login(loginDto as any, req, res)

    expect(result).toHaveProperty('token', 'tok')
    expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object))
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'ref', expect.any(Object))
    expect(res.cookie).toHaveBeenCalledWith('email', 'x@e.com', expect.any(Object))
  })
})