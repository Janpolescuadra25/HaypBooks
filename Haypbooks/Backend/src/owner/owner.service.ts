import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
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

  async getUsers(query?: string, page?: string, limit?: string) {
    const p = Math.max(1, parseInt(page || '1') || 1)
    const l = Math.max(1, Math.min(50, parseInt(limit || '20') || 20))
    const skip = (p - 1) * l

    const where = query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          suspended: true,
          createdAt: true,
          lastLogin: true,
          workspaceUsers: {
            select: {
              workspaceId: true,
              role: true,
              workspace: {
                select: {
                  company: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        suspended: u.suspended,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        companies: u.workspaceUsers.map((wu) => ({
          companyId: wu.workspace.company.id,
          companyName: wu.workspace.company.name,
          role: wu.role,
        })),
      })),
      pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    }
  }

  async getPlanDistribution() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        companyId: { not: null },
      },
      select: {
        plan: {
          select: { name: true, type: true, monthlyPrice: true },
        },
      },
    })

    const planMap = new Map<string, { planName: string; planType: string; monthlyPrice: number | null; count: number }>()
    for (const sub of subscriptions) {
      const key = sub.plan.name
      if (!planMap.has(key)) {
        planMap.set(key, {
          planName: sub.plan.name,
          planType: sub.plan.type,
          monthlyPrice: sub.plan.monthlyPrice ? Number(sub.plan.monthlyPrice) : null,
          count: 0,
        })
      }
      planMap.get(key)!.count++
    }

    const totalCompanies = await this.prisma.company.count()
    const subscribedCompanyIds = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', companyId: { not: null } },
      select: { companyId: true },
    })
    const subscribedSet = new Set(subscribedCompanyIds.map((s) => s.companyId))
    const unsubscribedCount = totalCompanies - subscribedSet.size

    const plans = Array.from(planMap.values()).sort((a, b) => b.count - a.count)

    return {
      plans,
      unsubscribedCompanies: unsubscribedCount,
      totalCompanies,
      totalActiveSubscriptions: subscriptions.length,
    }
  }

  async recordMetricsSnapshot() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await this.prisma.platformMetricsSnapshot.findFirst({
      where: {
        recordedAt: { gte: today, lt: tomorrow },
      },
    })
    if (existing) return existing

    const companies = await this.prisma.company.findMany({
      select: { id: true },
    })

    let totalR2StorageMb = 0
    for (const company of companies) {
      try {
        const attachmentsSize = await this.r2Service.getFolderSize(`attachments/${company.id}/`)
        const receiptsSize = await this.r2Service.getFolderSize(`receipts/${company.id}/`)
        totalR2StorageMb += attachmentsSize + receiptsSize
      } catch {
        // Individual company R2 errors should not block the snapshot
      }
    }

    const totalUsers = await this.prisma.user.count()

    const snapshot = await this.prisma.platformMetricsSnapshot.create({
      data: {
        totalCompanies: companies.length,
        totalUsers,
        totalDbStorageMb: 0,
        totalR2StorageMb,
        recordedAt: new Date(),
      },
    })

    return snapshot
  }

  async getMetricsHistory(days: string | number) {
    const d = Math.max(1, Math.min(90, parseInt(String(days)) || 30))
    const since = new Date()
    since.setDate(since.getDate() - d)

    const snapshots = await this.prisma.platformMetricsSnapshot.findMany({
      where: { recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    })

    return {
      snapshots,
      range: { days: d, from: since, to: new Date() },
      totalSnapshots: snapshots.length,
    }
  }

  async setUserSuspendStatus(userId: string, suspend: boolean, req: any) {
    const currentUserId = req.user?.userId
    if (!currentUserId) throw new UnauthorizedException()

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const before = user.suspended
    if (before === suspend) {
      return { message: suspend ? 'User is already suspended' : 'User is already active' }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { suspended: suspend },
    })

    const firstWorkspace = await this.prisma.workspaceUser.findFirst({
      where: { userId },
      select: { workspaceId: true },
    })
    const workspaceId = firstWorkspace?.workspaceId ?? null

    const firstCompany = await this.prisma.companyUser.findFirst({
      where: { userId },
      select: { companyId: true },
    })

    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        userId: currentUserId,
        companyId: firstCompany?.companyId ?? null,
        tableName: 'User',
        action: suspend ? 'SUSPEND' : 'REACTIVATE',
        recordId: userId,
        changes: {
          before: { suspended: before },
          after: { suspended: suspend },
        },
      },
    })

    return {
      message: suspend ? 'User suspended successfully' : 'User reactivated successfully',
      user: { id: updated.id, email: updated.email, name: updated.name, suspended: updated.suspended },
    }
  }
}
