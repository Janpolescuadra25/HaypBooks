import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface'
import { USER_REPOSITORY, OTP_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { MailService } from '../common/mail.service'

const CODE_TTL_MINUTES = 10

@Injectable()
export class VerificationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: IOtpRepository,
    private readonly mailService: MailService,
  ) {}

  async sendEmailCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
    // store code in OTP table (existing model)
    const created = await this.otpRepo.create({ email, otpCode: code, purpose: 'MFA', expiresAt } as any)
    // debug log created MFA row in dev
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[verification] sendEmailCode created', { email, otpCode: code, id: created.id, expiresAt })
    }

    // Build email
    const subject = 'Confirm Your Identity to Continue with HaypBooks'
    // try to use user's display name if available
    const maybeUser = await this.userRepo.findByEmail(email)
    const displayName = maybeUser?.name || ''
    const html = this.mailService.buildVerifyEmailOtpHtml(displayName, code)
    const text = this.mailService.buildVerifyEmailOtpText(displayName, code)

    try {
      await this.mailService.sendEmail(email, subject, html, text)
    } catch (err) {
      // do not expose mail sending errors directly
      throw new BadRequestException('Failed to send verification email')
    }

    // In development, return OTP for testing convenience (do NOT do this in production)
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, expiresAt, otp: code }
    }

    return { success: true, expiresAt }
  }

  async verifyEmailCode(email: string, code: string) {
    // Try MFA first; if MFA exists and matches, accept. If it exists and doesn't match,
    // fall back to VERIFY_EMAIL so dev flows that use send-verification still work.
    const mfaRow = await this.otpRepo.findLatestByEmail(email, 'MFA')
    if (mfaRow) {
      // eslint-disable-next-line no-console
      console.log('[verification] MFA row on verify attempt', { email, mfaRow: { id: mfaRow.id, otpCode: mfaRow.otpCode, expiresAt: mfaRow.expiresAt } })
      if (mfaRow.expiresAt < new Date()) {
        // expired MFA, proceed to check VERIFY_EMAIL
      } else if (mfaRow.otpCode === code) {
        await this.otpRepo.delete(mfaRow.id)
        // eslint-disable-next-line no-console
        console.log('[verification] accepted MFA row', { email, id: mfaRow.id })
        return { success: true }
      }
      // if MFA exists but doesn't match, we'll try VERIFY_EMAIL before failing
    }

    const verifyRow = await this.otpRepo.findLatestByEmail(email, 'VERIFY_EMAIL')
    // eslint-disable-next-line no-console
    console.log('[verification] VERIFY_EMAIL row', { email, verifyRow: verifyRow ? { id: verifyRow.id, otpCode: verifyRow.otpCode, expiresAt: verifyRow.expiresAt } : null })
    if (!verifyRow) {
      if (mfaRow) {
        await this.otpRepo.incrementAttempts(mfaRow.id)
      }
      throw new BadRequestException('No code found')
    }

    if (verifyRow.expiresAt < new Date()) {
      await this.otpRepo.incrementAttempts(verifyRow.id).catch(() => {})
      throw new BadRequestException('Code expired')
    }

    if (verifyRow.otpCode !== code) {
      // Increment attempts on the most relevant row (prefer MFA if present)
      // eslint-disable-next-line no-console
      console.log('[verification] code mismatch', { email, expected: verifyRow.otpCode, got: code })
      if (mfaRow) await this.otpRepo.incrementAttempts(mfaRow.id).catch(() => {})
      await this.otpRepo.incrementAttempts(verifyRow.id).catch(() => {})
      throw new BadRequestException('Invalid code')
    }

    // Success: consume/delete
    await this.otpRepo.delete(verifyRow.id).catch(() => {})
    // eslint-disable-next-line no-console
    console.log('[verification] accepted VERIFY_EMAIL row', { email, id: verifyRow.id })
    return { success: true }
  }

  // Phone flows: send a short numeric code to the phone and verify by phone
  async sendPhoneCode(phone: string) {
    // Normalize phone first
    const normalized = require('../utils/phone.util').normalizePhoneOrThrow(phone)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
    const created = await this.otpRepo.create({ phone: normalized, otpCode: code, purpose: 'MFA', expiresAt } as any)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      const maskedPhone = require('../utils/phone.util').maskPhoneForDisplay(normalized)
      console.log('[verification] sendPhoneCode created', { phone: maskedPhone, otpCode: code, id: created.id, expiresAt })
      return { success: true, expiresAt, otp: code }
    }
    return { success: true, expiresAt }
  }

  async verifyPhoneCode(phone: string, code: string) {
    const normalized = require('../utils/phone.util').normalizePhoneOrThrow(phone)
    const mfaRow = await this.otpRepo.findLatestByPhone(normalized, 'MFA')
    if (!mfaRow) throw new BadRequestException('No code found')
    // eslint-disable-next-line no-console
    const maskedPhone = require('../utils/phone.util').maskPhoneForDisplay(normalized)
    console.log('[verification] MFA row (phone) on verify attempt', { phone: maskedPhone, mfaRow: { id: mfaRow.id, otpCode: mfaRow.otpCode, expiresAt: mfaRow.expiresAt } })

    if (mfaRow.expiresAt < new Date()) {
      throw new BadRequestException('Code expired')
    }

    if (mfaRow.otpCode !== code) {
      await this.otpRepo.incrementAttempts(mfaRow.id).catch(() => {})
      throw new BadRequestException('Invalid code')
    }

    await this.otpRepo.delete(mfaRow.id).catch(() => {})
    // Mark user's phone as verified if we can find a user with that phone
    try {
      // Diagnostic: log normalized phone and attempt find
      // eslint-disable-next-line no-console
      console.log('[verification] verifying phone', { inputPhone: phone, normalized })

      const user = await this.userRepo.findByPhone?.(normalized)
      // eslint-disable-next-line no-console
      console.log('[verification] findByPhone result', { userId: user?.id, userPhone: user?.phone })

      if (user) {
        await this.userRepo.update(user.id, { phone: normalized, isPhoneVerified: true, phoneVerifiedAt: new Date() })
        // eslint-disable-next-line no-console
        const maskedPhone = require('../utils/phone.util').maskPhoneForDisplay(normalized)
        // eslint-disable-next-line no-console
        console.log('[verification] marked user phone verified', { userId: user.id, phone: maskedPhone })
      }
    } catch (err) {
      // do not fail verification if user update fails; just log
      // eslint-disable-next-line no-console
      console.error('[verification] failed to mark phone verified', { phone: normalized, err })
    }

    // eslint-disable-next-line no-console
    const maskedPhone2 = require('../utils/phone.util').maskPhoneForDisplay(normalized)
    console.log('[verification] accepted MFA row (phone)', { phone: maskedPhone2, id: mfaRow.id })
    return { success: true }
  }
}
