import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ContactsRepository } from './contacts.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ContactsService {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async assertCompanyAccess(userId: string, companyId: string) {
    const member = await this.prisma.workspaceUser.findFirst({
      where: {
        status: 'ACTIVE',
        workspace: { companies: { some: { id: companyId } } },
        userId,
      },
    })
    if (!member) throw new ForbiddenException('Access denied to this company')
    return member
  }

  private async getWorkspaceId(companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
    if (!company) throw new NotFoundException('Company not found')
    return company.workspaceId
  }

  async findCustomers(userId: string, companyId: string, opts: { search?: string; page?: number; limit?: number }) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.findCustomers(workspaceId, opts)
  }

  async findCustomerById(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.findCustomerById(workspaceId, id)
  }

  async createCustomer(userId: string, companyId: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.createCustomer(workspaceId, data)
  }

  async updateCustomer(userId: string, companyId: string, id: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const updated = await this.repo.updateCustomer(workspaceId, id, data)
    if (!updated) throw new NotFoundException('Customer not found')
    return updated
  }

  async softDeleteCustomer(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.softDeleteCustomer(workspaceId, id, userId)
  }

  async findVendors(userId: string, companyId: string, opts: { search?: string; page?: number; limit?: number }) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.findVendors(workspaceId, opts)
  }

  async findVendorById(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.findVendorById(workspaceId, id)
  }

  async createVendor(userId: string, companyId: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.createVendor(workspaceId, data)
  }

  async updateVendor(userId: string, companyId: string, id: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const updated = await this.repo.updateVendor(workspaceId, id, data)
    if (!updated) throw new NotFoundException('Vendor not found')
    return updated
  }

  async softDeleteVendor(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    return this.repo.softDeleteVendor(workspaceId, id, userId)
  }
}
