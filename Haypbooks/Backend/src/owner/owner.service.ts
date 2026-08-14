import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { R2Service } from '../common/r2/r2.service'

@Injectable()
export class OwnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }

  private getEffectiveLimitMb(storageLimit: any) {
    const planBase = storageLimit?.planBaseLimitMb ?? 0
    const ownerOverride = storageLimit?.ownerOverrideMb ?? 0
    const safetyNet = storageLimit?.safetyNetMb ?? 51200
    return Math.max(planBase, ownerOverride) + safetyNet
  }

  private getCompanySummary(company: any, dbStorageMb: number, r2StorageMb: number) {
    const planBaseLimitMb = company.storageLimit?.planBaseLimitMb ?? 0
    const ownerOverrideMb = company.storageLimit?.ownerOverrideMb ?? null
    const safetyNetMb = company.storageLimit?.safetyNetMb ?? 51200
    const effectiveLimitMb = this.getEffectiveLimitMb(company.storageLimit)
    const usagePercent = effectiveLimitMb > 0
      ? Number(((dbStorageMb + r2StorageMb) / effectiveLimitMb * 100).toFixed(2))
      : 0

    return {
      companyId: company.id,
      companyName: company.name,
      dbStorageMb,
      r2StorageMb,
      planBaseLimitMb,
      ownerOverrideMb,
      safetyNetMb,
      effectiveLimitMb,
      usagePercent,
      userCount: company.workspace?.users?.length ?? 0,
    }
  }

  async getPlatformStorageUsage() {
    const companies = await this.prisma.company.findMany({
      include: {
        storageLimit: true,
        workspace: { include: { users: true } },
      },
    })

    let totalDbStorageMb = 0
    let totalR2StorageMb = 0
    let totalUsers = 0

    const companySummaries = await Promise.all(companies.map(async (company) => {
      const dbStorageMb = 0 // TODO: implement per-company DB storage measurement
      const attachmentsSize = await this.r2Service.getFolderSize(`attachments/${company.id}/`)
      const receiptsSize = await this.r2Service.getFolderSize(`receipts/${company.id}/`)
      const r2StorageMb = attachmentsSize + receiptsSize
      totalDbStorageMb += dbStorageMb
      totalR2StorageMb += r2StorageMb
      totalUsers += company.workspace?.users?.length ?? 0

      return this.getCompanySummary(company, dbStorageMb, r2StorageMb)
    }))

    return {
      totalCompanies: companies.length,
      totalUsers,
      totalDbStorageMb,
      totalR2StorageMb,
      companies: companySummaries,
    }
  }

  async getCompanyStorageUsage(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        storageLimit: true,
        workspace: { include: { users: true } },
      },
    })

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`)
    }

    const dbStorageMb = 0 // TODO: implement per-company DB storage measurement
    const attachmentsSize = await this.r2Service.getFolderSize(`attachments/${company.id}/`)
    const receiptsSize = await this.r2Service.getFolderSize(`receipts/${company.id}/`)
    const r2StorageMb = attachmentsSize + receiptsSize

    const lastActivity = await this.prisma.auditLog.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })

    return {
      ...this.getCompanySummary(company, dbStorageMb, r2StorageMb),
      lastActivity,
    }
  }

  private async getWorkspaceId(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { workspaceId: true },
    })
    if (!company) {
      throw new NotFoundException('Company not found')
    }
    return company.workspaceId
  }

  async setStorageLimit(companyId: string, overrideMb: number | null, userId: string) {
    if (overrideMb !== null && (!Number.isInteger(overrideMb) || overrideMb < 0)) {
      throw new BadRequestException('overrideMb must be null or a positive integer')
    }

    const workspaceId = await this.getWorkspaceId(companyId)

    const existing = await this.prisma.storageLimit.findUnique({ where: { companyId } })
    const oldOverride = existing?.ownerOverrideMb ?? null

    const storageLimit = await this.prisma.storageLimit.upsert({
      where: { companyId },
      create: {
        companyId,
        planBaseLimitMb: 0,
        ownerOverrideMb: overrideMb,
        safetyNetMb: 51200,
      },
      update: {
        ownerOverrideMb: overrideMb,
      },
    })

    await this.prisma.auditLog.create({
      data: {
        tableName: 'StorageLimit',
        action: 'UPDATE',
        recordId: storageLimit.id.toString(),
        workspaceId,
        companyId,
        changes: { before: oldOverride, after: overrideMb },
        userId,
      },
    })

    return storageLimit
  }
}
