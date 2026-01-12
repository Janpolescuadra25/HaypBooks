import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
// Seed helper to create default roles when new tenant is created
let seedDefaultRolesForTenant: (tenantId: string) => Promise<void> = async () => {}
try { seedDefaultRolesForTenant = require('../../prisma/seed').seedDefaultRolesForTenant } catch (e) { /* best-effort only */ }

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
      console.info('[COMPANY-CREATE] ✅ prisma.tenant.create succeeded', {
        id: tenant.id,
        hasUserPayload: !!data.users
      })

      // Backfill safety: ensure a minimal Company record exists for this tenant.
      // Some legacy flows (POST /api/companies) only created Tenant rows; to ensure
      // the Owner Hub can show a Company card, create a minimal Company if missing.
      try {
        const existing = await this.prisma.company.findFirst({ where: { tenantId: tenant.id } })
        if (!existing) {
          const created = await this.prisma.company.create({ data: { tenantId: tenant.id, name: data.name || tenant.name || 'Company', isActive: true } })
          // eslint-disable-next-line no-console
          console.info('[COMPANY-CREATE] ✅ Backfilled Company for tenant (legacy flow):', { companyId: created.id, tenantId: tenant.id })
          try {
            await this.prisma.tenant.update({ where: { id: tenant.id }, data: { companiesCreated: { increment: 1 } } })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[COMPANY-CREATE] Failed to increment companiesCreated (non-fatal):', e?.message || e)
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[COMPANY-CREATE] Failed to backfill Company (non-fatal):', e?.message || e)
      }

      // Verify TenantUser was created
      try {
        const tenantUsers = await this.prisma.tenantUser.findMany({ where: { tenantId: tenant.id } })
        // eslint-disable-next-line no-console
        console.info('[COMPANY-CREATE] TenantUser records:', {
          tenantId: tenant.id,
          count: tenantUsers.length,
          users: tenantUsers.map(tu => ({ userId: tu.userId, isOwner: tu.isOwner, role: tu.role }))
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[COMPANY-CREATE] ❌ Failed to query TenantUser:', e?.message)
      }

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

      // After successful tenant creation, attempt to activate per-tenant trial
      // (best-effort: do not block tenant creation if this fails)
      try {
        if (!tenant.trialUsed) {
          const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          // Create subscription tied to this company (tenant-as-company) and mark tenant trial used
          await this.prisma.$transaction([
            this.prisma.subscription.create({ data: { companyId: tenant.id, plan: 'FREE', status: 'TRIAL' } }),
            this.prisma.tenant.update({ where: { id: tenant.id }, data: { trialEndsAt: trialEnds, trialUsed: true } }),
          ])
          // eslint-disable-next-line no-console
          console.info('[COMPANY-CREATE] Activated trial for tenant', { tenantId: tenant.id, trialEnds })
        }
      } catch (e) {
        // best-effort only
        // eslint-disable-next-line no-console
        console.error('[COMPANY-CREATE] Failed to activate trial for tenant (non-fatal):', e?.message || e)
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

        // Backfill (legacy raw insert path): ensure a minimal Company exists
        try {
          if (tenant && tenant.id) {
            const existing = await this.prisma.company.findFirst({ where: { tenantId: tenant.id } })
            if (!existing) {
              const created = await this.prisma.company.create({ data: { tenantId: tenant.id, name: name || tenant.name || 'Company', isActive: true } })
              // eslint-disable-next-line no-console
              console.info('[COMPANY-CREATE] ✅ Backfilled Company for tenant (raw insert path):', { companyId: created.id, tenantId: tenant.id })
              try {
                await this.prisma.tenant.update({ where: { id: tenant.id }, data: { companiesCreated: { increment: 1 } } })
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[COMPANY-CREATE] Failed to increment companiesCreated (non-fatal):', e?.message || e)
              }
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[COMPANY-CREATE] Failed to backfill Company for raw insert (non-fatal):', e?.message || e)
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

  // Return company only if the userId is a member of the owning tenant
  async findByIdForUser(userId: string, id: string) {
    return this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
        tenant: {
          users: { some: { userId, status: 'ACTIVE' } }
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            users: {
              where: { userId },
              select: { isOwner: true, lastAccessedAt: true }
            }
          }
        }
      }
    })
  }

  async findForUser(userId: string, filter?: string, email?: string) {
    // eslint-disable-next-line no-console
    console.info('[COMPANY-QUERY] Fetching companies for user', { userId, filter, email })
    
    // Default: return companies for tenants where the user is a member
    if (!filter) {
      const companies = await this.prisma.company.findMany({
        where: {
          isActive: true,
          tenant: {
            users: { some: { userId, status: 'ACTIVE' } }
          }
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              users: {
                where: { userId },
                select: { isOwner: true, lastAccessedAt: true }
              }
            }
          }
        }
      })
      // Defensive dedupe
      const seenAll = new Set<string>()
      const uniqueAll = [] as any[]
      for (const c of companies || []) {
        if (!c || !c.id) continue
        if (!seenAll.has(c.id)) {
          seenAll.add(c.id)
          uniqueAll.push(c)
        }
      }
      // eslint-disable-next-line no-console
      console.info('[COMPANY-QUERY] Results (no filter):', { count: uniqueAll.length, companies: uniqueAll.map(c => ({ id: c.id, name: c.name })) })
      return uniqueAll
    }

    if (filter === 'owned') {
      // eslint-disable-next-line no-console
      console.info('[COMPANY-QUERY] 🔍 Starting owned query for userId:', userId)
      
      const companies = await this.prisma.company.findMany({
        where: {
          isActive: true,
          tenant: {
            users: { some: { userId, isOwner: true, status: 'ACTIVE' } }
          }
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              users: {
                where: { userId },
                select: { isOwner: true, lastAccessedAt: true }
              }
            }
          }
        }
      })
      // Defensive dedupe in case DB join returned duplicate rows
      const seen = new Set<string>()
      const unique = [] as any[]
      for (const c of companies || []) {
        if (!c || !c.id) continue
        if (!seen.has(c.id)) {
          seen.add(c.id)
          unique.push(c)
        }
      }
      // eslint-disable-next-line no-console
      console.info('[COMPANY-QUERY] ✅ Results (owned):', { 
        count: unique.length, 
        companies: unique.map(c => ({ 
          id: c.id, 
          name: c.name, 
          tenantId: c.tenantId,
          isActive: c.isActive,
          tenantUsers: c.tenant?.users 
        })) 
      })
      return unique
    }

    if (filter === 'invited' && email) {
      // Find invites for this email that are pending
      const invites: any[] = await this.prisma.tenantInvite.findMany({ 
        where: { email, status: 'PENDING' }, 
        select: { tenantId: true } 
      })
      const tenantIds = invites.map((i) => i.tenantId)
      if (!tenantIds || !tenantIds.length) return []
      
      const companies = await this.prisma.company.findMany({
        where: {
          isActive: true,
          tenantId: { in: tenantIds }
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      // Defensive dedupe
      const seenI = new Set<string>()
      const uniqueI = [] as any[]
      for (const c of companies || []) {
        if (!c || !c.id) continue
        if (!seenI.has(c.id)) {
          seenI.add(c.id)
          uniqueI.push(c)
        }
      }
      return uniqueI
    }

    // Fallback: no filter matched
    const companies = await this.prisma.company.findMany({
      where: {
        isActive: true,
        tenant: {
          users: { some: { userId } }
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            users: {
              where: { userId },
              select: { isOwner: true, lastAccessedAt: true }
            }
          }
        }
      }
    })
    return companies
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
      SELECT t.id, tu."lastAccessedAt"
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

  // Create a child Company record (for multi-company tenants) and activate
  // the tenant trial (best-effort) when appropriate.
  async createCompanyRecord(data: any) {
    // eslint-disable-next-line no-console
    console.info('[COMPANY-CHILD-CREATE] 🚀 Starting createCompanyRecord with data:', {
      tenantId: data.tenantId,
      name: data.name,
      legalName: data.legalName,
      country: data.country,
      allKeys: Object.keys(data)
    })
    
    const company = await this.prisma.company.create({ data })
    
    // eslint-disable-next-line no-console
    console.info('[COMPANY-CHILD-CREATE] ✅ Company record created:', {
      companyId: company.id,
      name: company.name,
      tenantId: company.tenantId,
      isActive: company.isActive
    })
    
    // Increment companies created counter
    try {
      await this.prisma.tenant.update({
        where: { id: data.tenantId },
        data: { companiesCreated: { increment: 1 } }
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[COMPANY-CHILD-CREATE] Failed to increment companiesCreated (non-fatal):', e?.message || e)
    }

    try {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: data.tenantId } })
      if (tenant && !tenant.trialUsed) {
        const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        // Best-effort: ensure a subscription exists; handle races gracefully
        try {
          await this.ensureSubscriptionForCompany(company.id, { companyId: company.id, plan: 'FREE', status: 'TRIAL' })
        } catch (e) {
          // Log and continue; subscription race or DB error should not block onboarding
          // eslint-disable-next-line no-console
          console.error('[COMPANY-CHILD-CREATE] Subscription create check failed (non-fatal):', e?.message || e)
        }

        try {
          await this.prisma.tenant.update({ 
            where: { id: tenant.id }, 
            data: { 
              trialEndsAt: trialEnds, 
              trialUsed: true
            } 
          })
          // eslint-disable-next-line no-console
          console.info('[COMPANY-CHILD-CREATE] Activated trial for tenant', { tenantId: tenant.id, trialEnds })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[COMPANY-CHILD-CREATE] Failed to mark tenant trialUsed (non-fatal):', e?.message || e)
        }
      }
    } catch (e) {
      // best-effort only
      // eslint-disable-next-line no-console
      console.error('[COMPANY-CHILD-CREATE] Failed to activate trial for tenant (non-fatal):', e?.message || e)
    }

    return company
  }

  async ensureSubscriptionForCompany(companyId: string, data: any) {
    if (!companyId) throw new Error('companyId required')

    // Check for existing subscription first
    try {
      const existing = await this.prisma.subscription.findUnique({ where: { companyId } })
      if (existing) {
        // Ensure Company.subscriptionId is set
        await this.prisma.company.update({ 
          where: { id: companyId }, 
          data: { subscriptionId: existing.id } 
        }).catch(() => {}) // best-effort
        return existing
      }

      // Attempt to create; if a race occurs (unique constraint), fetch and return existing
      try {
        const created = await this.prisma.subscription.create({ data })
        // Update Company to reference this subscription
        await this.prisma.company.update({ 
          where: { id: companyId }, 
          data: { subscriptionId: created.id } 
        }).catch(() => {}) // best-effort
        return created
      } catch (ce) {
        // Prisma unique violation code
        const code = (ce && (ce.code || ce?.meta?.code)) as string | undefined
        if (code === 'P2002') {
          const existingAfterRace = await this.prisma.subscription.findUnique({ where: { companyId } })
          if (existingAfterRace) return existingAfterRace
        }
        throw ce
      }
    } catch (e) {
      // Re-throw for caller to decide (best-effort usage will catch)
      throw e
    }
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
