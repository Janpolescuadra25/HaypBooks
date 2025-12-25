import { VerificationService } from './verification.service'

const mockUserRepo: any = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
}
const mockOtpRepo: any = {
  create: jest.fn(),
  findLatestByEmail: jest.fn(),
  incrementAttempts: jest.fn(),
  delete: jest.fn(),
}
const mockMail: any = { send: jest.fn(), sendEmail: jest.fn(), buildVerifyEmailOtpHtml: jest.fn(), buildVerifyEmailOtpText: jest.fn() }

describe('VerificationService', () => {
  let svc: VerificationService

  beforeEach(() => {
    jest.clearAllMocks()
    svc = new VerificationService(mockUserRepo, mockOtpRepo, mockMail)
  })

  test('setupPin hashes and stores pin', async () => {
    mockUserRepo.update.mockResolvedValue({ id: 'u1' })
    const res = await svc.setupPin('u1', '123456')
    expect(res.success).toBe(true)
    expect(res).toHaveProperty('pinSetAt')
    expect(res).toHaveProperty('hasPin')
    expect(res.hasPin).toBe(true)
    expect(mockUserRepo.update).toHaveBeenCalled()
  })

  test('verifyPin throws when user missing', async () => {
    mockUserRepo.findById.mockResolvedValue(null)
    await expect(svc.verifyPin('u1', '000000')).rejects.toThrow()
  })

  test('sendEmailCode creates otp and calls mail', async () => {
    mockOtpRepo.create.mockResolvedValue({ id: 'o1' })
    mockMail.send.mockResolvedValue(true)
    mockMail.buildVerifyEmailOtpHtml.mockReturnValue('<p>code</p>')
    mockMail.buildVerifyEmailOtpText.mockReturnValue('code')
    mockUserRepo.findByEmail.mockResolvedValue({ name: 'Tester' })
    const res = await svc.sendEmailCode('x@example.com')
    expect(res.success).toBe(true)
    expect(mockOtpRepo.create).toHaveBeenCalled()
    expect(mockMail.sendEmail).toHaveBeenCalled()
  })
})
