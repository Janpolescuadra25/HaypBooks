import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { ISecurityEventRepository } from '../interfaces/security-event.repository.interface'

@Injectable()
export class PrismaSecurityEventRepository implements ISecurityEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: string
    email?: string
    type: string
    ipAddress?: string
    userAgent?: string
  }) {
    return this.prisma.userSecurityEvent.create({ data })
  }

  async findByUserId(userId: string, limit = 50) {
    return this.prisma.userSecurityEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async findByEmail(email: string, limit = 50) {
    return this.prisma.userSecurityEvent.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async countRecentByEmail(email: string, minutesAgo: number) {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000)
    return this.prisma.userSecurityEvent.count({
      where: {
        email,
        createdAt: { gte: since },
      },
    })
  }

  async countRecentByIp(ipAddress: string, minutesAgo: number) {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000)
    return this.prisma.userSecurityEvent.count({
      where: {
        ipAddress,
        createdAt: { gte: since },
      },
    })
  }
}
