import { MailService } from './mail.service'

// Helper: set + restore env var
function withEnv(key: string, value: string | undefined, fn: () => void) {
  const saved = process.env[key]
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
  try { fn() } finally {
    if (saved === undefined) delete process.env[key]
    else process.env[key] = saved
  }
}

describe('MailService — email builders', () => {
  let svc: MailService

  beforeEach(() => { svc = new MailService() })

  describe('buildVerifyEmailOtpHtml', () => {
    it('includes the OTP code', () => {
      const html = svc.buildVerifyEmailOtpHtml('Alice', '123456')
      expect(html).toContain('123456')
    })
  })

  describe('buildVerifyEmailOtpText', () => {
    it('includes the OTP code', () => {
      const text = svc.buildVerifyEmailOtpText('Alice', '987654')
      expect(text).toContain('987654')
    })
  })

  describe('buildPasswordResetHtml', () => {
    it('includes the reset code and recipient name', () => {
      const html = svc.buildPasswordResetHtml('Bob', '654321')
      expect(html).toContain('654321')
      expect(html).toContain('Bob')
    })

    it('falls back to "there" when name is empty', () => {
      const html = svc.buildPasswordResetHtml('', '000000')
      expect(html).toContain('there')
    })
  })

  describe('buildPasswordResetText', () => {
    it('includes the reset code', () => {
      const text = svc.buildPasswordResetText('Carol', '111222')
      expect(text).toContain('111222')
    })
  })

  describe('buildInviteHtml', () => {
    it('includes inviter name, workspace name and accept link', () => {
      const html = svc.buildInviteHtml('Dave', 'Acme Corp', 'http://localhost:3000/accept-invite?code=abc')
      expect(html).toContain('Dave')
      expect(html).toContain('Acme Corp')
      expect(html).toContain('http://localhost:3000/accept-invite?code=abc')
    })
  })

  describe('buildInviteText', () => {
    it('includes inviter name, workspace name and link', () => {
      const text = svc.buildInviteText('Eve', 'Tax Pros', 'http://example.com/invite')
      expect(text).toContain('Eve')
      expect(text).toContain('Tax Pros')
      expect(text).toContain('http://example.com/invite')
    })
  })
})

describe('MailService — sendEmail', () => {
  let svc: MailService
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    svc = new MailService()
    // Silence logger output during tests
    warnSpy = jest.spyOn((svc as any).logger, 'warn').mockImplementation(() => undefined)
    jest.spyOn((svc as any).logger, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => jest.restoreAllMocks())

  it('falls through to dev logger when no provider is configured', async () => {
    const original = { sendgrid: process.env.SENDGRID_API_KEY, smtp: process.env.SMTP_HOST }
    delete process.env.SENDGRID_API_KEY
    delete process.env.SMTP_HOST

    await svc.sendEmail('test@example.com', 'Subject', '<p>html</p>', 'text')

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('test@example.com'))

    // restore
    if (original.sendgrid) process.env.SENDGRID_API_KEY = original.sendgrid
    if (original.smtp) process.env.SMTP_HOST = original.smtp
  })

  it('attempts SendGrid when SENDGRID_API_KEY is set and logs on failure', async () => {
    jest.resetModules()
    // Mock @sendgrid/mail to throw so we can assert the warning path
    jest.mock('@sendgrid/mail', () => ({
      default: { setApiKey: jest.fn(), send: jest.fn().mockRejectedValue(new Error('SG error')) },
    }))

    const saved = process.env.SENDGRID_API_KEY
    process.env.SENDGRID_API_KEY = 'SG.test'
    delete process.env.SMTP_HOST

    // Create a fresh instance after mock is in place
    const { MailService: Fresh } = jest.requireActual('./mail.service') as any
    const fresh: MailService = new Fresh()
    jest.spyOn((fresh as any).logger, 'warn').mockImplementation(() => undefined)
    jest.spyOn((fresh as any).logger, 'log').mockImplementation(() => undefined)

    await fresh.sendEmail('x@example.com', 'S', '<b>h</b>', 't')
    // Should fall back to dev logger
    expect((fresh as any).logger.warn).toHaveBeenCalled()

    process.env.SENDGRID_API_KEY = saved
    jest.resetModules()
  })
})
