import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { ISessionRepository, Session } from '../interfaces/session.repository.interface'

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Partial<Session>): Promise<Session> {
    // Retry if a unique constraint on refreshToken occurs (rare race in tests)
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const created = await this.prisma.session.create({ data: data as any })
        return created as any
      } catch (e: any) {
        // Prisma unique constraint error code P2002; meta.target may include the field
        if (e?.code === 'P2002' && e?.meta?.target && (e.meta.target as string[]).includes('refreshToken')) {
          // regenerate a refresh token and retry
          try {
            (data as any).refreshToken = require('crypto').randomUUID()
          } catch (err) {
            // fallback: append timestamp
            (data as any).refreshToken = `${(data as any).refreshToken || 'r'}-${Date.now()}`
          }
          // loop to retry
          continue
        }
        throw e
      }
    }
    throw new Error('Failed to create session after retrying refreshToken')
  }

  async findById(id: string): Promise<Session | null> {
    const s = await this.prisma.session.findUnique({ where: { id } })
    return s as any ?? null
  }

  async findByRefreshToken(token: string): Promise<Session | null> {
    const s = await this.prisma.session.findUnique({ where: { refreshToken: token } })
    if (!s || (s as any).revoked) return null
    return s as any
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const updated = await this.prisma.session.update({ where: { id }, data: data as any })
    return updated as any
  }

  async findByUserId(userId: string, includeRevoked = false): Promise<Session[]> {
    const rows = await this.prisma.session.findMany({ where: { userId, ...(includeRevoked ? {} : { revoked: false }) } })
    return rows as any
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.session.delete({ where: { id } })
    return true
  }

  async deleteByUserId(userId: string): Promise<number> {
    const res = await this.prisma.session.deleteMany({ where: { userId } })
    return res.count
  }
}
