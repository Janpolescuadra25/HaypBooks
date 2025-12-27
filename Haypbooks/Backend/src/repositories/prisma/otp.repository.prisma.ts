import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IOtpRepository, Otp } from '../interfaces/otp.repository.interface'

@Injectable()
export class PrismaOtpRepository implements IOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Otp>): Promise<Otp> {
    // ensure purpose, default handled by DB / Prisma schema
    const created = await this.prisma.otp.create({ data: data as any })
    return created as any
  }

  async findLatestByEmail(email: string, purpose?: string): Promise<Otp | null> {
    const where: any = { email }
    if (purpose) where.purpose = purpose
    const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } })
    return row as any
  }

  async findLatestByPhone(phone: string, purpose?: string): Promise<Otp | null> {
    const where: any = { phone }
    if (purpose) where.purpose = purpose
    const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } })
    return row as any
  }

  async incrementAttempts(id: string): Promise<Otp> {
    const updated = await this.prisma.otp.update({ where: { id }, data: { attempts: { increment: 1 } } as any })
    return updated as any
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.otp.delete({ where: { id } })
    return true
  }

  async countRecentByEmail(email: string, minutes: number): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000)
    const count = await this.prisma.otp.count({ where: { email, createdAt: { gte: since } } })
    return count
  }

  async countRecentByPhone(phone: string, minutes: number): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000)
    const count = await this.prisma.otp.count({ where: { phone, createdAt: { gte: since } } })
    return count
  }
}
