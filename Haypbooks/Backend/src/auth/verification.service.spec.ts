// Verification service tests: PIN-related tests removed as PIN feature has been retired.
// Keep a minimal smoke test for sendEmailCode so the file remains useful for non-PIN behavior.

import { VerificationService } from './verification.service'

const mockOtpRepo: any = { create: jest.fn() }
const mockMail: any = { send: jest.fn(), sendEmail: jest.fn(), buildVerifyEmailOtpHtml: jest.fn(), buildVerifyEmailOtpText: jest.fn() }
const mockUserRepo: any = { findByEmail: jest.fn() }

describe('VerificationService (email flows only)', () => {
  let svc: VerificationService
  beforeEach(() => {
    jest.clearAllMocks()
    svc = new VerificationService(mockUserRepo, mockOtpRepo, mockMail)
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

  test('verifyPhoneCode accepts valid code and marks user verified', async () => {
    const normalized = '+15550001234'
    const otpRow = { id: 'otp1', phone: normalized, otpCode: '123456', expiresAt: new Date(Date.now() + 60000) }
    mockOtpRepo.findLatestByPhone = jest.fn().mockResolvedValue(otpRow)
    mockOtpRepo.delete = jest.fn().mockResolvedValue(true)

    const user = { id: 'u1', email: 'x@e.com', phone: normalized }
    mockUserRepo.findByPhone = jest.fn().mockResolvedValue(user)
    mockUserRepo.update = jest.fn().mockResolvedValue({ ...user, isPhoneVerified: true, phoneVerifiedAt: new Date() })

    const res = await svc.verifyPhoneCode(normalized, '123456')
    expect(res.success).toBe(true)
    expect(mockOtpRepo.delete).toHaveBeenCalledWith('otp1')
    expect(mockUserRepo.update).toHaveBeenCalled()
    const updateArgs = (mockUserRepo.update as jest.Mock).mock.calls[0]
    expect(updateArgs[0]).toBe('u1')
    expect(updateArgs[1]).toHaveProperty('isPhoneVerified', true)
    expect(updateArgs[1]).toHaveProperty('phone', normalized)
  })

  test('verifyPhoneCode does not fail if no user exists for phone', async () => {
    const normalized = '+15550009999'
    const otpRow = { id: 'otp2', phone: normalized, otpCode: '111111', expiresAt: new Date(Date.now() + 60000) }
    mockOtpRepo.findLatestByPhone = jest.fn().mockResolvedValue(otpRow)
    mockOtpRepo.delete = jest.fn().mockResolvedValue(true)

    mockUserRepo.findByPhone = jest.fn().mockResolvedValue(null)
    mockUserRepo.update = jest.fn()

    const res = await svc.verifyPhoneCode(normalized, '111111')
    expect(res.success).toBe(true)
    expect(mockOtpRepo.delete).toHaveBeenCalledWith('otp2')
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })
})
