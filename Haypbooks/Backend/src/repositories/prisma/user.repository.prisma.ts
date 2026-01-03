import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IUserRepository, User } from '../interfaces/user.repository.interface'

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase()
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = this.normalizeEmail(email)
    if (!normalized) return null
    // Use case-insensitive match so users can sign in regardless of email casing.
    const u = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: normalized,
          mode: 'insensitive',
        },
      },
    })
    return u as any
  }

  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } })
    return u as any
  }

  async create(data: Partial<User>): Promise<User> {
    const toCreate: any = { ...(data as any) }
    if (toCreate.email) toCreate.email = this.normalizeEmail(toCreate.email)
    const created = await this.prisma.user.create({ data: toCreate })
    return created as any
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Use the generated Prisma client for updates now that `prisma generate` has been run.
    const toUpdate: any = { ...(data as any) }
    if (toUpdate.email) toUpdate.email = this.normalizeEmail(toUpdate.email)
    const updated = await this.prisma.user.update({ where: { id }, data: toUpdate })
    return updated as any
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({ where: { id } })
    return true
  }

  async findByResetToken(token: string): Promise<User | null> {
    const u = await this.prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: Math.floor(Date.now() / 1000) } } })
    return u as any
  }

  async findByPhone(phone: string): Promise<User | null> {
    // Normalize phone first
    const normalize = require('../../utils/phone.util').normalizePhoneOrThrow
    let normalized: string
    try { normalized = normalize(phone) } catch (e) { return null }

    // Try HMAC lookup if HMAC_KEY is configured
    let hmac: string | null = null
    try { hmac = require('../../utils/hmac.util').hmacPhone(normalized) } catch (e) { hmac = null }

    // Diagnostic log for easier triage in dev/test
    // eslint-disable-next-line no-console
    console.log('[prisma-user-repo] findByPhone', { input: phone, normalized, hasHmac: !!hmac })

    if (hmac) {
      const where: any = { OR: [{ phoneHmac: hmac }, { phone: normalized }] }
      const u = await this.prisma.user.findFirst({ where })
      if (u) return u as any
    } else {
      const u = await this.prisma.user.findFirst({ where: { phone: normalized } })
      if (u) return u as any
    }

    // Tolerant fallback: try suffix match on national number (best-effort)
    const digits = normalized.replace(/\D/g, '')
    const suffixLengths = [10, 9, 8, 7]
    for (const len of suffixLengths) {
      if (digits.length > len) {
        const suffix = digits.slice(-len)
        // eslint-disable-next-line no-console
        console.log('[prisma-user-repo] suffix-lookup', { suffixLength: len, suffix })
        const u2 = await this.prisma.user.findFirst({ where: { phone: { endsWith: suffix } } })
        if (u2) return u2 as any
      }
    }

    return null
  }
}
