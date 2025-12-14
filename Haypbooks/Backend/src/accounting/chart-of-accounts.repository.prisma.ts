import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ChartOfAccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, payload: any) {
    const data = { companyId, ...payload }
    return this.prisma.account.create({ data })
  }

  async listForCompany(companyId: string) {
    return this.prisma.account.findMany({ where: { tenantId: companyId } })
  }

  async findById(id: string) {
    return this.prisma.account.findUnique({ where: { id } })
  }
}
