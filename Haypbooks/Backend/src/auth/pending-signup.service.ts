import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import * as bcrypt from '../utils/bcrypt-fallback'
import { PrismaService } from '../repositories/prisma/prisma.service'

type PendingData = {
  email: string
  hashedPassword: string
  name?: string
  role?: string
  phone?: string
  phoneCountry?: string
  companyName?: string
  firmName?: string
  emailOtpVerified?: boolean
  phoneOtpVerified?: boolean
  emailOtpVerifiedAt?: number
  phoneOtpVerifiedAt?: number
  createdAt: number
}

/**
 * DB-backed PendingSignupService stores pending signups in Postgres via Prisma.
 * Tokens are returned as `${id}.${secret}` where `id` maps to the DB row id and
 * `secret` is hashed in the DB for secure comparison.
 */
@Injectable()
export class PendingSignupService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSecret() {
    return randomBytes(12).toString('hex')
  }

  private makeToken(id: string, secret: string) {
    return `${id}.${secret}`
  }

  async create(data: Omit<PendingData, 'createdAt'>, ttlSeconds = 60 * 30) {
    const id = randomBytes(6).toString('hex')
    const secret = this.generateSecret()
    const tokenHash = await bcrypt.hash(secret, 10)
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

    const created = await this.prisma.emailVerificationToken.create({
      data: {
        id,
        email: data.email,
        tokenHash,
        data: { ...data },
        expiresAt,
      },
    })

    return this.makeToken(created.id, secret)
  }

  async get(token: string) {
    const [id, secret] = String(token).split('.')
    if (!id || !secret) return null
    const row = await this.prisma.emailVerificationToken.findUnique({ where: { id } })
    if (!row) return null
    if (row.consumedAt) return null
    if (new Date() > row.expiresAt) return null

    const ok = await bcrypt.compare(secret, row.tokenHash)
    if (!ok) return null
    return row.data as PendingData | null
  }

  async update(token: string, patch: Partial<PendingData>) {
    const [id, secret] = String(token).split('.')
    if (!id || !secret) return null
    const row = await this.prisma.emailVerificationToken.findUnique({ where: { id } })
    if (!row) return null
    if (row.consumedAt) return null
    if (new Date() > row.expiresAt) return null

    const ok = await bcrypt.compare(secret, row.tokenHash)
    if (!ok) return null

    const current = (row.data || {}) as any
    const nextData = { ...current, ...patch }
    const updated = await this.prisma.emailVerificationToken.update({ where: { id }, data: { data: nextData } })
    return updated.data as PendingData
  }

  async delete(token: string) {
    const [id] = String(token).split('.')
    if (!id) return false
    try {
      await this.prisma.emailVerificationToken.delete({ where: { id } })
      return true
    } catch (e) {
      return false
    }
  }
}
