import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
// Seed helper to create default roles when new tenant is created
import { seedDefaultRolesForTenant } from '../../prisma/seed'

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const tenant = await this.prisma.tenant.create({ data })
    // Create default roles and permissions for the tenant (best-effort)
    try {
      await seedDefaultRolesForTenant(tenant.id)
    } catch (e) {
      // Non-fatal: seeding should not block tenant creation
      // Log warning in server logs (avoid holding up response)
      // eslint-disable-next-line no-console
      console.warn('seedDefaultRolesForTenant failed', e)
    }

    return tenant
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
