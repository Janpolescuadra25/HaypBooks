import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
// Seed helper to create default roles when new tenant is created
import { seedDefaultRolesForTenant } from '../../prisma/seed'

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // Try the straightforward Prisma path first. If the DB enforces a legacy
    // non-NULL `id_old` column (not present in the Prisma schema), this may fail
    // with a constraint error; in that case, fall back to a raw SQL insert that
    // includes `id_old` to satisfy legacy DBs.
    try {
      const tenant = await this.prisma.tenant.create({ data })
      // eslint-disable-next-line no-console
      console.debug('[CompanyRepository] prisma.tenant.create succeeded', { id: tenant.id })

      try {
        await this.prisma.$executeRaw`UPDATE public."Tenant" SET "id_old" = ${tenant.id} WHERE id = ${tenant.id}`
      } catch (e) {
        // ignore
      }

      // Create default roles and permissions for the tenant (best-effort)
      try {
        await seedDefaultRolesForTenant(tenant.id)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('seedDefaultRolesForTenant failed', e)
      }

      return tenant
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[CompanyRepository] prisma.tenant.create failed, falling back to raw insert', { err: err?.message })
      // Fallback: raw SQL insert including `id_old` so legacy DBs accept the row.
      // Generate an id on the application side so we can set both id and id_old.
      const { randomUUID } = await import('crypto')
      const id = data.id || randomUUID()
      const idOld = data.id_old || id
      const name = data.name || null
      const subdomain = data.subdomain || null
      const baseCurrency = data.baseCurrency || null
      const status = data.status || 'ACTIVE'

      try {
        // eslint-disable-next-line no-console
        console.debug('[CompanyRepository] attempting raw INSERT with id,id_old', { id, idOld })
        const rows: any[] = await this.prisma.$queryRawUnsafe(
          `INSERT INTO public."Tenant" ("id","name","subdomain","baseCurrency","createdAt","updatedAt","id_old") VALUES ($1::uuid,$2,$3,$4,now(),now(),$5) RETURNING *`,
          id,
          name,
          subdomain,
          baseCurrency,
          idOld,
        )

        const tenant = rows && rows.length ? rows[0] : null
        // eslint-disable-next-line no-console
        console.debug('[CompanyRepository] raw INSERT result', { tenant })

        // Create roles (best-effort)
        try {
          if (tenant && tenant.id) await seedDefaultRolesForTenant(tenant.id)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('seedDefaultRolesForTenant failed', e)
        }

        return tenant
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug('[CompanyRepository] raw INSERT failed', { message: e?.message })
        // If we still fail, rethrow the original error for visibility
        throw err
      }
    }
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
