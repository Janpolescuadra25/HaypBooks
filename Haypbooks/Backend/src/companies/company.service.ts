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

  async listCompaniesForUser(userId: string, filter?: string, email?: string) {
    return this.repo.findForUser(userId, filter, email)
  }

  async listRecentForUser(userId: string, limit = 10) {
    return this.repo.findRecentForUser(userId, limit)
  }

  async updateLastAccessed(userId: string, tenantId: string) {
    // Defensive: ensure inputs
    if (!userId || !tenantId) return { success: false }
    return this.repo.updateTenantUserLastAccessed(userId, tenantId)
  }

  async acceptInvite(userId: string, inviteId: string, setIsAccountant: boolean = false) {
    if (!userId || !inviteId) return { success: false }
    // Delegate to repository which knows about TenantInvite / TenantUser semantics
    const result = await this.repo.acceptInviteForUser(userId, inviteId, setIsAccountant)
    return result
  }
}
