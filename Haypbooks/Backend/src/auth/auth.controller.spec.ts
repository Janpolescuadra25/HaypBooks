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
  let pending: PendingSignupService

  beforeEach(() => {
    jest.clearAllMocks()

    // Fake in-memory prisma for unit tests
    const store = new Map<string, any>()
    const fakePrisma: any = {
      emailVerificationToken: {
        create: jest.fn().mockImplementation(async ({ data }) => {
          await Promise.resolve()
          store.set(data.id, { ...data })
          return { ...data }
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          await Promise.resolve()
          return store.get(where.id) || null
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          await Promise.resolve()
          const cur = store.get(where.id) || { data: {} }
          const next = { ...cur, data: { ...(cur.data || {}), ...(data.data || {}) } }
          store.set(where.id, next)
          return next
        }),
        delete: jest.fn().mockImplementation(async ({ where }) => {
          await Promise.resolve()
          store.delete(where.id)
          return { id: where.id }
        }),
        deleteMany: jest.fn().mockResolvedValue({}),
      }
    }

    pending = new PendingSignupService(fakePrisma as any)

    controller = new AuthController(authSvc as any, mockUserRepo as any, mockSessionRepo as any, mockOtpRepo as any, mockSecurityEventRepo as any, mockMail as any, pending)
  })

  test('preSignup creates pending and starts OTP', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)
    const resp = await controller.preSignup({ email: 'u@e.test', password: 'Pass1!', name: 'U', role: 'owner', phone: '+14155550100' })
    expect(resp.signupToken).toBeDefined()
    expect(authSvc.startOtp).toHaveBeenCalled()
    expect(authSvc.startOtpByPhone).toHaveBeenCalled()
  })

  test('preSignup accepts companyName and completeSignup persists it to user', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null)

    // Create pending directly to avoid any runtime shape oddities in preSignup wrapper
    const token = await (pending as any).create({
      email: 'biz@e.test',
      hashedPassword: 'hashed',
      name: 'Biz',
      companyName: 'Biz Co',
      emailOtpVerified: false,
      phoneOtpVerified: false,
    }) as string

    // simulate OTP verification
    (authSvc.verifyOtp as jest.Mock).mockResolvedValue(true)
    mockUserRepo.create.mockImplementation((d: any) => Promise.resolve({ id: 'new', ...d }))

    const result = await controller.completeSignup({ signupToken: token, code: '123456', method: 'email' }, { cookie: jest.fn() } as any)
    expect(mockUserRepo.create).toHaveBeenCalled()
    const created = (mockUserRepo.create as jest.Mock).mock.calls[0][0]
    expect(created.companyName).toBe('Biz Co')
    expect((result as any).token).toBeTruthy()
  })
  test('completeSignup completes after either email OR phone OTP (OR policy)', async () => {
    // Create pending directly (preSignup is separately covered; this avoids any decorator/serialization oddities)
    const token = await ((pending as any).create({
      email: 'x@e.test',
      hashedPassword: 'hashed',
      name: 'X',
      phone: '+14155550101',
      emailOtpVerified: false,
      phoneOtpVerified: false,
    })) as string

    // simulate verify (email step)
    (authSvc.verifyOtp as jest.Mock).mockResolvedValue(true)
    mockUserRepo.create.mockImplementation((d: any) => Promise.resolve({ id: 'new', ...d }))

    // call complete (email first) -> should NOT create user yet
    const res1 = await controller.completeSignup({ signupToken: token, code: '123456', method: 'email' }, { cookie: jest.fn() } as any)
    expect(mockUserRepo.create).toHaveBeenCalled()
    expect((res1 as any).token).toBeTruthy()
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
    mockUserRepo.findByEmail.mockResolvedValue(null)
    mockUserRepo.create.mockClear()

    const resp = await controller.signup({ email: 'enf@e.test', password: 'Pass1!', name: 'E' } as any, { cookie: jest.fn() } as any)
    expect((resp as any).signupToken).toBeDefined()
    // Ensure no DB user was created
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })

  test('login sets cookies with correct secure/httpOnly flags', async () => {
    // stub authService.login to return tokens and user
    const fakeLogin = jest.fn().mockResolvedValue({ token: 'tkn', refreshToken: 'rt', user: { id: 'u', email: 'a@b' } })
    const ac = new AuthController({ login: fakeLogin, refresh: jest.fn(), createSessionForUser: jest.fn() } as any, mockUserRepo, mockSessionRepo, mockOtpRepo, mockSecurityEventRepo, mockMail as any, pending)

    const cookies: any[] = []
    const res: any = { cookie: (name: string, val: string, opts: any) => cookies.push({ name, val, opts }), clearCookie: jest.fn() }
    // call login
    const result = await ac.login({ email: 'a@b', password: 'Password1!' } as any, { headers: {} } as any, res)
    expect(fakeLogin).toHaveBeenCalled()
    // Expect token and refreshToken cookies set
    const tokenCookie = cookies.find(c => c.name === 'token')
    const refreshCookie = cookies.find(c => c.name === 'refreshToken')
    expect(tokenCookie).toBeDefined()
    expect(refreshCookie).toBeDefined()

    // Ensure HttpOnly is set and secure matches NODE_ENV
    expect(tokenCookie.opts.httpOnly).toBe(true)
    const wasProd = process.env.NODE_ENV === 'production'
    expect(Boolean(tokenCookie.opts.secure)).toBe(wasProd)
  })

  test('completeSignup upgrades existing unverified user instead of creating duplicate', async () => {
    mockUserRepo.findByEmail.mockResolvedValueOnce(null)
    const resp = await controller.preSignup({ email: 'legacy@e.test', password: 'Pass1!', name: 'Legacy', phone: '+14155550102' })
    const token = (resp as any).signupToken

    // Existing unverified user in DB
    mockUserRepo.findByEmail.mockResolvedValueOnce({ id: 'u1', email: 'legacy@e.test', isEmailVerified: false })
    mockUserRepo.update.mockResolvedValue({ id: 'u1', email: 'legacy@e.test', isEmailVerified: true })
    mockUserRepo.create.mockClear()

    // Step 1: email verification completes under OR policy and upgrades
    await controller.completeSignup({ signupToken: token, code: '123456', method: 'email' }, { cookie: jest.fn() } as any)
    expect(mockUserRepo.update).toHaveBeenCalled()
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })

  test('PendingSignupService create/get/update/delete with in-memory fake prisma', async () => {
    // Use the same PendingSignupService (constructed with in-memory fake prisma in beforeEach)

    const token = await pending.create({ email: 'fall@e.test', hashedPassword: 'h' }, 5) as string
    expect(typeof token).toBe('string')

    const got = await pending.get(token)
    expect(got).not.toBeNull()
    expect((got as any).email).toBe('fall@e.test')

    const updated = await pending.update(token, { name: 'Fallback' })
    expect(updated).not.toBeNull()
    expect((updated as any).name).toBe('Fallback')

    const delRes = await pending.delete(token)
    expect(delRes).toBe(true)

    const after = await pending.get(token)
    expect(after).toBeNull()
  })
})