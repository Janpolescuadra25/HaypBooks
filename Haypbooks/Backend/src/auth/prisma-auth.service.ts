import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ISessionRepository } from '../repositories/interfaces/session.repository.interface'
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface'

@Injectable()
export class PrismaAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: IOtpRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    const existing = await this.userRepo.findByEmail(email)
    if (existing) throw new ConflictException('Email already registered')

    const hashed = await bcrypt.hash(password, 10)
    const user = await this.userRepo.create({ email, password: hashed, name, isEmailVerified: false })

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role })
    return { token, user }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) throw new UnauthorizedException()
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new UnauthorizedException()

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })
    // create refresh session (longer lived)
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.sessionRepo.create({ userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date() })

    return { token, refreshToken, user }
  }

  async refresh(refreshToken: string) {
    // find session
    const session = await this.sessionRepo.findByRefreshToken(refreshToken)
    if (!session) return null
    if ((new Date(session.expiresAt)).getTime() < Date.now() || session.revoked) {
      // expired
      return null
    }

    // sign a fresh access token
    const user = await this.userRepo.findById(session.userId)
    if (!user) return null
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })
    // Optional: rotate refresh token
    const newRefresh = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    // delete old session and create new one
    try {
      await this.sessionRepo.delete(session.id)
    } catch {}
    await this.sessionRepo.create({ userId: user.id, refreshToken: newRefresh, expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent, lastUsedAt: new Date() })

    return { token, refreshToken: newRefresh, user }
  }

  async startOtp(email: string, otpCode?: string, ttlMinutes = 5, purpose: string = 'RESET') {
    // generate 6-digit numeric otp if none supplied
    const code = otpCode || String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
    // attempts default 0
    const created = await this.otpRepo.create({ email, otpCode: code, expiresAt, purpose })
    return created
  }

  async verifyOtp(email: string, otpCode: string, consume: boolean = false) {
    const row = await this.otpRepo.findLatestByEmail(email)
    if (!row) return false
    const expiryTs = typeof row.expiresAt === 'number' ? row.expiresAt : (row.expiresAt instanceof Date ? row.expiresAt.getTime() : Number(row.expiresAt))
    if (expiryTs < Date.now()) return false
    if (row.attempts >= 5) return false
    if (row.otpCode !== otpCode) {
      await this.otpRepo.incrementAttempts(row.id)
      return false
    }

    // On successful verification: decide whether to consume (delete) OTP.
    // For email verification (purpose === 'VERIFY') we delete it immediately.
    // For password reset flows we'll only delete when explicitly asked to consume (so reset can still use it).
    try {
      if (consume || (row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'VERIFY') {
        await this.otpRepo.delete(row.id)
      }
    } catch (e) {}

    // If this OTP was used to VERIFY an email, mark user as verified
    try {
      if ((row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'VERIFY') {
        const user = await this.userRepo.findByEmail(email)
        if (user) await this.userRepo.update(user.id, { isEmailVerified: true })
      }
    } catch (e) {
      // ignore errors here
    }

    return true
  }
}
