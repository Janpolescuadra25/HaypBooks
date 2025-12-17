import { Injectable, Inject } from '@nestjs/common'
import { CompanyRepository } from './company.repository.prisma'

@Injectable()
export class CompanyService {
  constructor(private readonly repo: CompanyRepository) {}

  async createCompany(payload: any) {
    // Validation/permissions go here
    return this.repo.create(payload)
  }

  async getCompany(id: string) {
    return this.repo.findById(id)
  }

  async listCompaniesForUser(userId: string) {
    return this.repo.findForUser(userId)
  }

  async updateLastAccessed(userId: string, tenantId: string) {
    // Defensive: ensure inputs
    if (!userId || !tenantId) return { success: false }
    return this.repo.updateTenantUserLastAccessed(userId, tenantId)
  }
}
