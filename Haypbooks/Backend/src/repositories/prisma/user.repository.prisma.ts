import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IUserRepository, User } from '../interfaces/user.repository.interface'

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { email } })
    return u as any
  }

  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } })
    return u as any
  }

  async create(data: Partial<User>): Promise<User> {
    const created = await this.prisma.user.create({ data: data as any })
    return created as any
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Use the generated Prisma client for updates now that `prisma generate` has been run.
    const updated = await this.prisma.user.update({ where: { id }, data: data as any })
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
    const u = await this.prisma.user.findFirst({ where: { phone } })
    return u as any
  }
}
