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
}
