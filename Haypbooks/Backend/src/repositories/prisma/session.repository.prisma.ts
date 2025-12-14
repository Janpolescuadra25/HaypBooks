import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { ISessionRepository, Session } from '../interfaces/session.repository.interface'

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Session>): Promise<Session> {
    const created = await this.prisma.session.create({ data: data as any })
    return created as any
  }

  async findByRefreshToken(token: string): Promise<Session | null> {
    const s = await this.prisma.session.findUnique({ where: { refreshToken: token } })
    if (!s || (s as any).revoked) return null
    return s as any
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
