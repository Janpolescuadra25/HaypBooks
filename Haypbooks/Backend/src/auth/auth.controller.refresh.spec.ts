import { AuthController } from './auth.controller'

describe('AuthController refresh debug behaviors', () => {
  function makeController(mocks: any = {}) {
    const fakeAuth: any = mocks.authService || { refresh: jest.fn().mockResolvedValue(null) }
    const fakeUserRepo: any = mocks.userRepo || { findByEmail: jest.fn() }
    const fakeSessionRepo: any = mocks.sessionRepo || { findByRefreshToken: jest.fn().mockResolvedValue(null) }
    const fakeOtp: any = mocks.otpRepo || {}
    const fakeSecurityEvent: any = mocks.securityEventRepo || { create: jest.fn() }
    const fakeMail: any = mocks.mailService || {}
    const fakePending: any = mocks.pendingSignupService || {}

    return new AuthController(fakeAuth, fakeUserRepo, fakeSessionRepo, fakeOtp, fakeSecurityEvent, fakeMail, fakePending)
  }

  test('debug info returns tokenFromHeader when cookie present', async () => {
    const controller = makeController()
    const req: any = { headers: { cookie: 'refreshToken=abc123', 'x-debug-allow': 'info' }, ip: '1.2.3.4' }
    const res: any = {}
    const result = await controller.refresh(req, res)
    expect(result).toBeDefined()
    expect((result as any).debug).toBe(true)
    expect((result as any).tokenFromHeader).toBe('abc123')
  })

  test('debug exec calls authService.refresh and sets cookies when present', async () => {
    const fakeAuth: any = { refresh: jest.fn().mockResolvedValue({ token: 'newtok', refreshToken: 'newrefresh', user: { id: 'u1', email: 'a@b.c' } }) }
    const fakeSessionRepo: any = { findByRefreshToken: jest.fn().mockResolvedValue(null) }
    const controller = makeController({ authService: fakeAuth, sessionRepo: fakeSessionRepo })

    const cookiesSet: any[] = []
    const res: any = { cookie: (name: string, val: string, opts: any) => cookiesSet.push({ name, val, opts }) }
    const req: any = { headers: { cookie: 'refreshToken=oldrefresh', 'x-debug-allow': 'exec' }, ip: '1.2.3.4' }

    const result = await controller.refresh(req, res)
    expect(result).toBeDefined()
    expect((result as any).debug).toBe(true)
    expect((result as any).token).toBe('newtok')
    expect(fakeAuth.refresh).toHaveBeenCalled()
    // Ensure cookies were set for token and refreshToken
    const tokenCookie = cookiesSet.find(c => c.name === 'token')
    const refreshCookie = cookiesSet.find(c => c.name === 'refreshToken')
    expect(tokenCookie).toBeDefined()
    expect(refreshCookie).toBeDefined()
  })
})
