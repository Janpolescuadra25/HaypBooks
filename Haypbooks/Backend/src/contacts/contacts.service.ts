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
    const result = await this.repo.createCustomer(workspaceId, data)
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'CREATE',
        tableName: 'Customer',
        recordId: result.contactId,
        changes: {
          displayName: result.contact?.displayName ?? '',
          email: result.contact?.contactEmails?.[0]?.email ?? null,
        },
      },
    }).catch(() => {})
    return result
  }

  async updateCustomer(userId: string, companyId: string, id: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const updated = await this.repo.updateCustomer(workspaceId, id, data)
    if (!updated) throw new NotFoundException('Customer not found')
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'UPDATE',
        tableName: 'Customer',
        recordId: id,
        changes: data,
      },
    }).catch(() => {})
    return updated
  }

  async softDeleteCustomer(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const result = await this.repo.softDeleteCustomer(workspaceId, id, userId)
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'DELETE',
        tableName: 'Customer',
        recordId: id,
        changes: { status: 'INACTIVE' },
      },
    }).catch(() => {})
    return result
  }

  async getCustomerAuditLog(userId: string, companyId: string, customerId: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const logs = await this.prisma.auditLog.findMany({
      where: { workspaceId, recordId: customerId },
      include: { user: { select: { id: true, name: true, email: true } }, lines: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return logs.map(log => ({
      id: log.id,
      action: log.action,
      tableName: log.tableName,
      performedBy: log.user?.name || log.user?.email || 'System',
      performedAt: log.createdAt,
      changes: log.changes,
      lines: log.lines.map(l => ({
        fieldName: l.fieldName,
        oldValue: l.oldValue,
        newValue: l.newValue,
        changeType: l.changeType,
      })),
    }))
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
    const result = await this.repo.createVendor(workspaceId, data)
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'CREATE',
        tableName: 'Vendor',
        recordId: result.contactId,
        changes: {
          displayName: result.contact?.displayName ?? '',
        },
      },
    }).catch(() => {})
    return result
  }

  async updateVendor(userId: string, companyId: string, id: string, data: any) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const updated = await this.repo.updateVendor(workspaceId, id, data)
    if (!updated) throw new NotFoundException('Vendor not found')
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'UPDATE',
        tableName: 'Vendor',
        recordId: id,
        changes: data,
      },
    }).catch(() => {})
    return updated
  }

  async softDeleteVendor(userId: string, companyId: string, id: string) {
    await this.assertCompanyAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const result = await this.repo.softDeleteVendor(workspaceId, id, userId)
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        companyId,
        userId,
        action: 'DELETE',
        tableName: 'Vendor',
        recordId: id,
        changes: { status: 'INACTIVE' },
      },
    }).catch(() => {})
    return result
  }
}
