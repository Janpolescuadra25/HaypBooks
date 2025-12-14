import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.tenant.create({ data })
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } })
  }

  async findForUser(userId: string) {
    return this.prisma.tenant.findMany({ where: { users: { some: { userId } } } })
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({ where: { id }, data })
  }
}
