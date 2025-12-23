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

  async findForUser(userId: string, filter?: string, email?: string) {
    // Default: return tenants where the user is a member
    if (!filter) return this.prisma.tenant.findMany({ where: { users: { some: { userId } } } })

    if (filter === 'owned') {
      return this.prisma.tenant.findMany({ where: { users: { some: { userId, isOwner: true } } } })
    }

    if (filter === 'invited' && email) {
      // Find invites for this email that are pending
      const invites: any[] = await this.prisma.tenantInvite.findMany({ where: { email, status: 'PENDING' }, select: { tenantId: true } })
      const tenantIds = invites.map((i) => i.tenantId)
      if (!tenantIds || !tenantIds.length) return []
      return this.prisma.tenant.findMany({ where: { id: { in: tenantIds } } })
    }

    // Fallback: no filter matched
    return this.prisma.tenant.findMany({ where: { users: { some: { userId } } } })
  }

  // Update the TenantUser.lastAccessedAt for the tenant that owns the given companyId
  // Accepts a userId and a companyId (the controller passes company id in the route)
  async updateTenantUserLastAccessed(userId: string, companyId: string) {
    if (!userId || !companyId) return { success: false }

    // Use raw SQL to fetch the tenantId for the company to remain resilient to schema mismatches
    const rows: any[] = await this.prisma.$queryRaw`SELECT "tenantId" FROM public."Company" WHERE "id" = ${companyId} LIMIT 1`
    const companyTenantId = rows && rows.length ? (rows[0] as any).tenantId : null
    if (!companyTenantId) return { success: false }

    const res = await this.prisma.tenantUser.updateMany({ where: { tenantId: companyTenantId, userId }, data: { lastAccessedAt: new Date() } })
    return { success: res.count > 0 }
  }

  // Return recent tenants (companies) the user has accessed, ordered by lastAccessedAt desc
  async findRecentForUser(userId: string, limit = 10) {
    if (!userId) return []
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT t.id, t.name, t.subdomain, tu."lastAccessedAt"
      FROM public."Tenant" t
      JOIN public."TenantUser" tu ON tu."tenantId" = t.id
      WHERE tu."userId" = ${userId}
      ORDER BY tu."lastAccessedAt" DESC NULLS LAST
      LIMIT ${limit}
    `
    return rows || []
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({ where: { id }, data })
  }

  // Accept a pending TenantInvite for a user: create TenantUser and mark invite accepted
  async acceptInviteForUser(userId: string, inviteId: string, setIsAccountant: boolean = false) {
    if (!userId || !inviteId) return { success: false }

    const invite = await this.prisma.tenantInvite.findUnique({ where: { id: inviteId }, include: { role: true } })
    if (!invite) return { success: false, reason: 'invite_not_found' }
    if (invite.status !== 'PENDING') return { success: false, reason: 'invite_not_pending' }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, reason: 'user_not_found' }

    // Only the invited email may accept the invite
    if ((invite.email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      return { success: false, reason: 'email_mismatch' }
    }

    // Create tenant user row if missing
    try {
      await this.prisma.tenantUser.upsert({
        where: { tenantId_userId: { tenantId: invite.tenantId, userId } },
        create: {
          tenantId: invite.tenantId,
          userId,
          role: invite.role ? invite.role.name : 'member',
          roleId: invite.roleId || null,
          isOwner: false,
          joinedAt: new Date(),
          status: 'ACTIVE',
        },
        update: { status: 'ACTIVE', role: invite.role ? invite.role.name : 'member', roleId: invite.roleId || null },
      })
    } catch (e) {
      // continue but record failure
      console.warn('tenantUser upsert failed', e?.message)
    }

    // Mark invite accepted
    await this.prisma.tenantInvite.update({ where: { id: inviteId }, data: { status: 'ACCEPTED', acceptedAt: new Date() } })

    // Decide whether to mark user as accountant
    let shouldSetAccountant = setIsAccountant
    if (!shouldSetAccountant && invite.role && invite.role.name) {
      const rn = invite.role.name.toLowerCase()
      if (rn.includes('accountant')) shouldSetAccountant = true
    }

    if (shouldSetAccountant) {
      try {
        await this.prisma.user.update({ where: { id: userId }, data: { isAccountant: true } })
      } catch (e) {
        // ignore
      }
    }

    return { success: true, redirect: shouldSetAccountant ? '/hub/accountant' : '/hub/companies' }
  }
}
