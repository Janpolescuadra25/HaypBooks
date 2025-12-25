import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface'
import { USER_REPOSITORY, OTP_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { MailService } from '../common/mail.service'

const BCRYPT_ROUNDS = 12
const CODE_TTL_MINUTES = 10

@Injectable()
export class VerificationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: IOtpRepository,
    private readonly mailService: MailService,
  ) {}

  async setupPin(userId: string, pin: string) {
    if (!/^[0-9]{6}$/.test(pin)) throw new BadRequestException('Invalid PIN format')
    const hash = await bcrypt.hash(pin, BCRYPT_ROUNDS)
    const now = new Date()
    const updated = await this.userRepo.update(userId, { pinHash: hash, pinSetAt: now } as any)
    return { success: true, pinSetAt: now, hasPin: true }
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    if (!user.pinHash) throw new BadRequestException('PIN not set for account')
    const valid = await bcrypt.compare(pin, user.pinHash)
    if (!valid) throw new BadRequestException('Invalid PIN')
    // Optionally record last used, etc.
    await this.userRepo.update(userId, { /* could track lastUsedAt */ } as any)
    return { success: true }
  }

  async sendEmailCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
    // store code in OTP table (existing model)
    await this.otpRepo.create({ email, otpCode: code, purpose: 'MFA', expiresAt } as any)

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

    return { success: true, expiresAt }
  }

  async verifyEmailCode(email: string, code: string) {
    const row = await this.otpRepo.findLatestByEmail(email, 'MFA')
    if (!row) throw new BadRequestException('No code found')
    if (row.expiresAt < new Date()) throw new BadRequestException('Code expired')
    if (row.otpCode !== code) {
      await this.otpRepo.incrementAttempts(row.id)
      throw new BadRequestException('Invalid code')
    }
    // Success: consume/delete
    await this.otpRepo.delete(row.id)
    return { success: true }
  }
}
