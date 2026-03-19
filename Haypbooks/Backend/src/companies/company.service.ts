import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { CompanyRepository } from './company.repository.prisma'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AccountingService } from '../accounting/accounting.service'

@Injectable()
export class CompanyService {
  constructor(
    private readonly repo: CompanyRepository,
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService,
  ) { }

  async createCompany(payload: any) {
    // Validation/permissions go here
    try {
      console.info('[COMPANY-SERVICE] createCompany called with payload keys:', Object.keys(payload || {}))
      const res = await this.repo.create(payload)
      console.info('[COMPANY-SERVICE] createCompany result:', { id: res?.id })
      // Auto-seed the default Philippine COA for the newly created company (best-effort)
      try {
        const company = await this.prisma.company.findFirst({ where: { workspaceId: res.id } })
        if (company?.id) {
          await this.accountingService.seedDefaultAccounts(company.id)
          console.info('[COMPANY-SERVICE] Auto-seeded default COA for company:', { companyId: company.id })
        }
      } catch (seedErr: any) {
        console.warn('[COMPANY-SERVICE] Auto-seed COA failed (non-fatal):', seedErr?.message)
      }
      return res
    } catch (e) {
      console.error('[COMPANY-SERVICE] createCompany error:', e?.message || e)
      throw e
    }
  }

  async getCompany(id: string) {
    return this.repo.findById(id)
  }

  // Return company only if the given user is a member of the owning tenant
  async getCompanyForUser(userId: string, id: string) {
    if (!userId) return null
    return this.repo.findByIdForUser(userId, id)
  }

  // Create a Company record under an existing tenant. This is used during the
  // transition when onboarding creates a Tenant (legacy behavior) but we also
  // want a proper Company row representing the business/books entity.
  async createCompanyUnderTenant(tenantId: string, companyData: any) {
    const company = await this.repo.createCompanyRecord({
      workspaceId: tenantId,
      ...companyData
    })
    // Auto-seed the default Philippine COA for the new company (best-effort)
    try {
      if (company?.id) {
        await this.accountingService.seedDefaultAccounts(company.id)
        console.info('[COMPANY-SERVICE] Auto-seeded default COA for company:', { companyId: company.id })
      }
    } catch (seedErr: any) {
      console.warn('[COMPANY-SERVICE] Auto-seed COA failed (non-fatal):', seedErr?.message)
    }
    return company
  }

  async listCompaniesForUser(userId: string, filter?: string, email?: string) {
    return this.repo.findForUser(userId, filter, email)
  }

  async listRecentForUser(userId: string, limit = 10) {
    return this.repo.findRecentForUser(userId, limit)
  }

  /** Returns the ID of the workspace owned by the given user, or null if none exists. */
  async getOwnedWorkspaceId(userId: string): Promise<string | null> {
    const ws = await this.prisma.workspace.findUnique({ where: { ownerUserId: userId }, select: { id: true } })
    return ws?.id ?? null
  }

  /**
   * Returns the WorkspaceCapabilities feature flags for the workspace the given
   * user belongs to. If no record exists yet, returns sensible defaults so the
   * frontend can always rely on a complete flags object.
   */
  async getWorkspaceCapabilities(userId: string) {
    // Resolve the user's workspace (owned workspace takes precedence via asc sort)
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [
          { ownerUserId: userId },
          { users: { some: { userId, status: 'ACTIVE' } } },
        ],
      },
      include: { capabilities: true },
      orderBy: { createdAt: 'asc' },
    })

    const defaults = {
      companiesEnabled: false,
      practicesEnabled: false,
      accountingEnabled: true,
      arEnabled: true,
      apEnabled: true,
      bankingEnabled: true,
      reportingEnabled: true,
      taxEnabled: true,
      payrollEnabled: false,
      inventoryEnabled: false,
      projectsEnabled: false,
      timeTrackingEnabled: false,
      integrationsEnabled: false,
    }

    if (!workspace || !workspace.capabilities) return defaults

    // Cast to include the new fields added in migration add_workspace_capability_flags
    // (Prisma types update after `prisma generate` runs in the dev environment)
    const c = workspace.capabilities as typeof workspace.capabilities & {
      accountingEnabled: boolean
      arEnabled: boolean
      apEnabled: boolean
      bankingEnabled: boolean
      reportingEnabled: boolean
      taxEnabled: boolean
      payrollEnabled: boolean
      inventoryEnabled: boolean
      projectsEnabled: boolean
      timeTrackingEnabled: boolean
      integrationsEnabled: boolean
    }
    return {
      companiesEnabled: c.companiesEnabled,
      practicesEnabled: c.practicesEnabled,
      accountingEnabled: c.accountingEnabled ?? defaults.accountingEnabled,
      arEnabled: c.arEnabled ?? defaults.arEnabled,
      apEnabled: c.apEnabled ?? defaults.apEnabled,
      bankingEnabled: c.bankingEnabled ?? defaults.bankingEnabled,
      reportingEnabled: c.reportingEnabled ?? defaults.reportingEnabled,
      taxEnabled: c.taxEnabled ?? defaults.taxEnabled,
      payrollEnabled: c.payrollEnabled ?? defaults.payrollEnabled,
      inventoryEnabled: c.inventoryEnabled ?? defaults.inventoryEnabled,
      projectsEnabled: c.projectsEnabled ?? defaults.projectsEnabled,
      timeTrackingEnabled: c.timeTrackingEnabled ?? defaults.timeTrackingEnabled,
      integrationsEnabled: c.integrationsEnabled ?? defaults.integrationsEnabled,
    }
  }

  async updateLastAccessed(userId: string, workspaceId: string) {
    // Defensive: ensure inputs
    if (!userId || !workspaceId) return { success: false }
    return this.repo.updateTenantUserLastAccessed(userId, workspaceId)
  }

  async acceptInvite(userId: string, inviteId: string, setIsAccountant: boolean = false) {
    if (!userId || !inviteId) return { success: false }
    // Delegate to repository which knows about TenantInvite / TenantUser semantics
    const result = await this.repo.acceptInviteForUser(userId, inviteId, setIsAccountant)
    return result
  }

  // ─── Update & Archive ──────────────────────────────────────────────────────

  async updateCompany(userId: string, companyId: string, data: any) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const allowed = { name: data.name, industry: data.industry, businessType: data.businessType }
    return this.prisma.company.update({ where: { id: companyId }, data: allowed as any })
  }

  async archiveCompany(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    // Only workspace owners can archive
    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: { workspaceId: (company as any).workspaceId, userId, isOwner: true },
    })
    if (!workspaceUser) throw new ForbiddenException('Only workspace owners can archive a company')
    return this.prisma.company.update({ where: { id: companyId }, data: { isActive: false } })
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async getSettings(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const settings = await this.prisma.companySettings.findUnique({ where: { companyId } }).catch(() => null)
    return settings || { companyId }
  }

  async updateSettings(userId: string, companyId: string, data: any) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    return this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId, ...data },
      update: { ...data },
    }).catch(async () => {
      // If CompanySettings model doesn't exist yet, fall back to updating the Company record directly
      const allowed: any = {}
      if (data.address) allowed.address = data.address
      if (data.logoUrl) allowed.logoUrl = data.logoUrl
      if (data.invoicePrefix) allowed.invoicePrefix = data.invoicePrefix
      if (data.paymentTerms) allowed.paymentTerms = data.paymentTerms
      if (data.currency) allowed.currency = data.currency
      if (data.fiscalStart) allowed.fiscalYearStart = data.fiscalStart
      return this.prisma.company.update({ where: { id: companyId }, data: allowed as any })
    })
  }

  // ─── Company Users ─────────────────────────────────────────────────────────

  async listCompanyUsers(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const members = await this.prisma.workspaceUser.findMany({
      where: { workspaceId: (company as any).workspaceId, status: 'ACTIVE' },
      include: { user: { select: { id: true, email: true, name: true } }, Role: { select: { id: true, name: true } } } as any,
    })
    return members
  }

  async grantCompanyAccess(requestingUserId: string, companyId: string, targetUserId: string, roleId?: string) {
    const company = await this.repo.findByIdForUser(requestingUserId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const workspaceId = (company as any).workspaceId
    const existing = await this.prisma.workspaceUser.findFirst({ where: { workspaceId, userId: targetUserId } })
    if (existing) {
      return this.prisma.workspaceUser.update({
        where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
        data: { status: 'ACTIVE', ...(roleId ? { roleId } : {}) },
      })
    }
    return this.prisma.workspaceUser.create({
      data: { workspaceId, userId: targetUserId, isOwner: false, joinedAt: new Date(), status: 'ACTIVE', ...(roleId ? { roleId } : { roleId: undefined }) } as any,
    })
  }

  async revokeCompanyAccess(requestingUserId: string, companyId: string, targetUserId: string) {
    const company = await this.repo.findByIdForUser(requestingUserId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const workspaceOwner = await this.prisma.workspaceUser.findFirst({
      where: { workspaceId: (company as any).workspaceId, userId: requestingUserId, isOwner: true },
    })
    if (!workspaceOwner) throw new ForbiddenException('Only workspace owners can revoke access')
    if (targetUserId === requestingUserId) throw new ForbiddenException('Cannot revoke your own access')
    await this.prisma.workspaceUser.updateMany({
      where: { workspaceId: (company as any).workspaceId, userId: targetUserId },
      data: { status: 'INACTIVE' },
    })
    return { success: true }
  }

  async updateUserRole(requestingUserId: string, companyId: string, targetUserId: string, roleId: string) {
    const company = await this.repo.findByIdForUser(requestingUserId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const workspaceId = (company as any).workspaceId
    const member = await this.prisma.workspaceUser.findFirst({ where: { workspaceId, userId: targetUserId, status: 'ACTIVE' } })
    if (!member) throw new NotFoundException('User not found in this company')
    return this.prisma.workspaceUser.update({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      data: { roleId },
    })
  }

  // ─── Invites ──────────────────────────────────────────────────────────────

  async listInvites(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    return this.prisma.workspaceInvite.findMany({
      where: { workspaceId: (company as any).workspaceId, status: 'PENDING' },
      include: { role: { select: { id: true, name: true } } },
    })
  }

  async sendInvite(userId: string, companyId: string, email: string, roleId?: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const workspaceId = (company as any).workspaceId
    // Cancel any existing pending invite for this email/workspace
    await this.prisma.workspaceInvite.updateMany({
      where: { workspaceId, email: email.toLowerCase().trim(), status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })
    const { randomUUID } = await import('crypto')
    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: email.toLowerCase().trim(),
        invitedBy: userId,
        status: 'PENDING',
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ...(roleId ? { roleId } : {}),
      } as any,
    })
    return invite
  }

  async cancelInvite(userId: string, companyId: string, inviteId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    await this.prisma.workspaceInvite.updateMany({
      where: { id: inviteId, workspaceId: (company as any).workspaceId },
      data: { status: 'CANCELLED' },
    })
    return { success: true }
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  async listRoles(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    return this.prisma.role.findMany({
      where: { workspaceId: (company as any).workspaceId },
      include: { rolePermissions: { include: { permission: true } } } as any,
    })
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboardSummary(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [revenueAgg, expenseAgg, invoiceAgg, billAgg] = await Promise.all([
      this.prisma.journalEntryLine.aggregate({
        where: { companyId, account: { type: 'REVENUE' } as any, journalEntry: { status: 'POSTED', date: { gte: startOfMonth } } } as any,
        _sum: { credit: true },
      }).catch(() => ({ _sum: { credit: null } })),
      this.prisma.journalEntryLine.aggregate({
        where: { companyId, account: { type: 'EXPENSE' } as any, journalEntry: { status: 'POSTED', date: { gte: startOfMonth } } } as any,
        _sum: { debit: true },
      }).catch(() => ({ _sum: { debit: null } })),
      (this.prisma.invoice as any).aggregate({ where: { companyId, status: { notIn: ['VOID', 'DRAFT'] } }, _sum: { totalAmount: true }, _count: true }).catch(() => ({ _sum: { totalAmount: null }, _count: 0 })),
      (this.prisma.bill as any).aggregate({ where: { companyId, status: { notIn: ['VOID', 'DRAFT'] } }, _sum: { totalAmount: true }, _count: true }).catch(() => ({ _sum: { totalAmount: null }, _count: 0 })),
    ])

    const revenue = Number((revenueAgg as any)._sum?.credit ?? 0)
    const expenses = Number((expenseAgg as any)._sum?.debit ?? 0)
    return {
      period: { start: startOfMonth, end: now },
      revenue, expenses,
      profit: revenue - expenses,
      invoiceCount: (invoiceAgg as any)._count ?? 0,
      invoiceTotal: Number((invoiceAgg as any)._sum?.totalAmount ?? 0),
      billCount: (billAgg as any)._count ?? 0,
      billTotal: Number((billAgg as any)._sum?.totalAmount ?? 0),
    }
  }

  async getCashPosition(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true } as any,
      select: { id: true, accountName: true, currentBalance: true, currency: true } as any,
    }).catch(() => [])
    const total = (accounts as any[]).reduce((s, a) => s + Number((a as any).currentBalance ?? 0), 0)
    return { accounts, totalCash: total }
  }

  async getReceivablesSummary(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const agg = await (this.prisma.invoice as any).aggregate({
      where: { companyId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      _sum: { balance: true, totalAmount: true },
      _count: true,
    }).catch(() => ({ _sum: { balance: null, totalAmount: null }, _count: 0 }))
    return {
      outstanding: Number((agg as any)._sum?.balance ?? (agg as any)._sum?.totalAmount ?? 0),
      invoiceCount: (agg as any)._count ?? 0,
    }
  }

  async getPayablesSummary(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const agg = await (this.prisma.bill as any).aggregate({
      where: { companyId, status: { in: ['APPROVED', 'PARTIAL', 'OVERDUE'] } },
      _sum: { balance: true, totalAmount: true },
      _count: true,
    }).catch(() => ({ _sum: { balance: null, totalAmount: null }, _count: 0 }))
    return {
      outstanding: Number((agg as any)._sum?.balance ?? (agg as any)._sum?.totalAmount ?? 0),
      billCount: (agg as any)._count ?? 0,
    }
  }

  async getRecentTransactions(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const txns = await (this.prisma as any).bankTransaction?.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      take: 20,
    }).catch(() => []) ?? []
    return txns
  }

  async getUpcomingItems(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const [invoices, bills] = await Promise.all([
      (this.prisma.invoice as any).findMany({
        where: { companyId, dueDate: { lte: next30 }, status: { notIn: ['PAID', 'VOID'] } },
        orderBy: { dueDate: 'asc' },
        take: 10,
        select: { id: true, invoiceNumber: true, totalAmount: true, dueDate: true, status: true },
      }).catch(() => []),
      (this.prisma.bill as any).findMany({
        where: { companyId, dueDate: { lte: next30 }, status: { notIn: ['PAID', 'VOID'] } },
        orderBy: { dueDate: 'asc' },
        take: 10,
        select: { id: true, billNumber: true, totalAmount: true, dueDate: true, status: true },
      }).catch(() => []),
    ])

    return {
      invoicesDue: invoices,
      billsDue: bills,
    }
  }

  // ─── Business Health ───────────────────────────────────────────────────────

  async getHealthMetrics(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')

    const [assets, liabilities, revenue, expenses] = await Promise.all([
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'ASSET' } as any } as any, _sum: { debit: true, credit: true } }).catch(() => ({ _sum: { debit: null, credit: null } })),
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'LIABILITY' } as any } as any, _sum: { debit: true, credit: true } }).catch(() => ({ _sum: { debit: null, credit: null } })),
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'REVENUE' } as any } as any, _sum: { credit: true } }).catch(() => ({ _sum: { credit: null } })),
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'EXPENSE' } as any } as any, _sum: { debit: true } }).catch(() => ({ _sum: { debit: null } })),
    ])

    const totalAssets = Number((assets as any)._sum?.debit ?? 0) - Number((assets as any)._sum?.credit ?? 0)
    const totalLiabilities = Number((liabilities as any)._sum?.credit ?? 0) - Number((liabilities as any)._sum?.debit ?? 0)
    const totalRevenue = Number((revenue as any)._sum?.credit ?? 0)
    const totalExpenses = Number((expenses as any)._sum?.debit ?? 0)
    const netIncome = totalRevenue - totalExpenses
    const equity = totalAssets - totalLiabilities

    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
    const debtToEquity = equity > 0 ? totalLiabilities / equity : null
    const healthScore = Math.min(100, Math.max(0, 50 + grossMargin / 2 - (debtToEquity ?? 0) * 5))

    return {
      totalAssets, totalLiabilities, equity,
      totalRevenue, totalExpenses, netIncome,
      grossMargin: Math.round(grossMargin * 100) / 100,
      debtToEquity, healthScore: Math.round(healthScore),
    }
  }

  async getLiquidityRatios(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const [currentAssets, currentLiabilities] = await Promise.all([
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'ASSET', subType: { in: ['CURRENT_ASSET', 'BANK', 'CASH'] } } as any } as any, _sum: { debit: true, credit: true } }).catch(() => ({ _sum: { debit: null, credit: null } })),
      this.prisma.journalEntryLine.aggregate({ where: { companyId, account: { type: 'LIABILITY', subType: { in: ['CURRENT_LIABILITY', 'ACCOUNTS_PAYABLE'] } } as any } as any, _sum: { credit: true, debit: true } }).catch(() => ({ _sum: { credit: null, debit: null } })),
    ])
    const ca = Number((currentAssets as any)._sum?.debit ?? 0) - Number((currentAssets as any)._sum?.credit ?? 0)
    const cl = Number((currentLiabilities as any)._sum?.credit ?? 0) - Number((currentLiabilities as any)._sum?.debit ?? 0)
    const currentRatio = cl > 0 ? ca / cl : null
    return { currentAssets: ca, currentLiabilities: cl, currentRatio, quickRatio: currentRatio }
  }

  async getProfitabilityMetrics(userId: string, companyId: string) {
    const metrics = await this.getHealthMetrics(userId, companyId)
    const netMargin = metrics.totalRevenue > 0 ? (metrics.netIncome / metrics.totalRevenue) * 100 : 0
    return {
      grossMargin: metrics.grossMargin,
      netMargin: Math.round(netMargin * 100) / 100,
      netIncome: metrics.netIncome,
      totalRevenue: metrics.totalRevenue,
    }
  }

  async getHealthTrends(userId: string, companyId: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')

    const monthRanges = Array.from({ length: 6 }, (_, index) => {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      start.setMonth(start.getMonth() - (5 - index))

      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      return { start, end }
    })

    const trends = await Promise.all(monthRanges.map(async ({ start, end }) => {
      const [revenueAgg, expenseAgg, assetsAgg, liabilitiesAgg] = await Promise.all([
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            account: { type: 'REVENUE' } as any,
            journalEntry: { status: 'POSTED', date: { gte: start, lt: end } },
          } as any,
          _sum: { credit: true },
        }).catch(() => ({ _sum: { credit: null } })),
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            account: { type: 'EXPENSE' } as any,
            journalEntry: { status: 'POSTED', date: { gte: start, lt: end } },
          } as any,
          _sum: { debit: true },
        }).catch(() => ({ _sum: { debit: null } })),
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            account: { type: 'ASSET' } as any,
            journalEntry: { status: 'POSTED', date: { lt: end } },
          } as any,
          _sum: { debit: true, credit: true },
        }).catch(() => ({ _sum: { debit: null, credit: null } })),
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            account: { type: 'LIABILITY' } as any,
            journalEntry: { status: 'POSTED', date: { lt: end } },
          } as any,
          _sum: { debit: true, credit: true },
        }).catch(() => ({ _sum: { debit: null, credit: null } })),
      ])

      const revenue = Number((revenueAgg as any)._sum?.credit ?? 0)
      const expenses = Number((expenseAgg as any)._sum?.debit ?? 0)
      const netIncome = revenue - expenses
      const totalAssets = Number((assetsAgg as any)._sum?.debit ?? 0) - Number((assetsAgg as any)._sum?.credit ?? 0)
      const totalLiabilities = Number((liabilitiesAgg as any)._sum?.credit ?? 0) - Number((liabilitiesAgg as any)._sum?.debit ?? 0)
      const equity = totalAssets - totalLiabilities
      const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0
      const debtToEquity = equity > 0 ? totalLiabilities / equity : 0
      const healthScore = Math.round(Math.min(100, Math.max(0, 55 + margin - debtToEquity * 8)))

      return {
        month: start.toISOString().slice(0, 7),
        label: start.toLocaleString('en-US', { month: 'short' }),
        revenue,
        expenses,
        netIncome,
        healthScore,
      }
    }))

    return { trends }
  }

  // ─── Overdue Items ─────────────────────────────────────────────────────────

  async getOverdueItems(userId: string, companyId: string, type?: string) {
    const company = await this.repo.findByIdForUser(userId, companyId)
    if (!company) throw new NotFoundException('Company not found')
    const now = new Date()

    const [invoices, bills] = await Promise.all([
      (!type || type === 'invoices') ? (this.prisma.invoice as any).findMany({
        where: { companyId, dueDate: { lt: now }, status: { notIn: ['PAID', 'VOID'] } },
        orderBy: { dueDate: 'asc' },
        select: { id: true, invoiceNumber: true, totalAmount: true, balance: true, dueDate: true, status: true },
      }).catch(() => []) : Promise.resolve([]),
      (!type || type === 'bills') ? (this.prisma.bill as any).findMany({
        where: { companyId, dueDate: { lt: now }, status: { notIn: ['PAID', 'VOID'] } },
        orderBy: { dueDate: 'asc' },
        select: { id: true, billNumber: true, totalAmount: true, balance: true, dueDate: true, status: true },
      }).catch(() => []) : Promise.resolve([]),
    ])

    const all = [
      ...(invoices as any[]).map(i => ({ ...i, type: 'invoice' })),
      ...(bills as any[]).map(b => ({ ...b, type: 'bill' })),
    ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    const totalOverdueValue = all.reduce((sum, item) => {
      return sum + Number((item as any).balance ?? (item as any).totalAmount ?? 0)
    }, 0)
    return { items: all, count: all.length, totalOverdueValue }
  }
}

