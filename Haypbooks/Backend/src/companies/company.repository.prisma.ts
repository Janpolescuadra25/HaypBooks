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
      const tenant = await this.prisma.workspace.create({ data })
      // eslint-disable-next-line no-console
      console.info('[COMPANY-CREATE] ✅ prisma.workspace.create succeeded', {
        id: tenant.id,
        hasUserPayload: !!data.users
      })

      // Backfill safety: ensure a minimal Company record exists for this tenant.
      // Some legacy flows (POST /api/companies) only created Tenant rows; to ensure
      // the Owner Workspace can show a Company card, create a minimal Company if missing.
      // However, callers can opt out of this backfill by setting `suppressCompanyCreation` on payload.
      if (data && data.suppressCompanyCreation) {
        // eslint-disable-next-line no-console
        console.info('[COMPANY-CREATE] Skipping Company backfill due to suppressCompanyCreation flag', { workspaceId: tenant.id })
      } else {
        try {
          const existing = await this.prisma.company.findFirst({ where: { workspaceId: tenant.id } })
          if (!existing) {
            // If caller supplied a country code (e.g., 'PH') attempt to resolve it to countryId
            try {
              if (data && !data.countryId && data.country) {
                const code = String(data.country).trim()
                const c = await this.prisma.country.findUnique({ where: { code } as any }).catch(() => null)
                if (c && c.id) data.countryId = c.id
              }
            } catch (e) {
              // ignore; best-effort
            }

            const created = await this.prisma.company.create({ data: { workspace: { connect: { id: tenant.id } }, name: data.name || (tenant as any).workspaceName || 'Company', countryId: data.countryId || data.countryId, isActive: true } as any })
            // eslint-disable-next-line no-console
            console.info('[COMPANY-CREATE] ✅ Backfilled Company for tenant (legacy flow):', { companyId: created.id, workspaceId: tenant.id })
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
      }

      // Verify TenantUser was created
      try {
        const tenantUsers = await this.prisma.workspaceUser.findMany({ where: { workspaceId: tenant.id } })
        // eslint-disable-next-line no-console
        console.info('[COMPANY-CREATE] WorkspaceUser records:', {
          workspaceId: tenant.id,
          count: tenantUsers.length,
          users: tenantUsers.map(tu => ({ userId: tu.userId, isOwner: tu.isOwner, role: (tu as any).role }))
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[COMPANY-CREATE] ❌ Failed to query WorkspaceUser:', e?.message)
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
          // Ensure subscription exists for this company (centralized validation)
          await this.ensureSubscriptionForCompany(tenant.id, { companyId: tenant.id, plan: 'FREE', status: 'TRIAL' })
          await this.prisma.workspace.update({ where: { id: tenant.id }, data: { trialEndsAt: trialEnds, trialUsed: true } })
        }
      } catch (e) {
        // best-effort only
        // eslint-disable-next-line no-console
        console.error('[COMPANY-CREATE] Failed to activate trial for tenant (non-fatal):', e?.message || e)
      }

      return tenant
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[CompanyRepository] prisma.workspace.create failed, falling back to raw insert', { err: err?.message })
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
        console.debug('[CompanyRepository] attempting tolerant raw INSERT (detecting Tenant columns) with id,id_old', { id, idOld })

        // Dynamically detect which Tenant columns exist in the DB and construct an INSERT
        const colsRes: Array<{ column_name: string }> = (await this.prisma.$queryRaw`
          SELECT column_name FROM information_schema.columns WHERE table_name = 'Tenant'
        `) as any
        const existingCols = new Set(colsRes.map(r => r.column_name))

        // Base columns we always include where possible
        const insertCols: string[] = []
        const values: any[] = []
        const placeholders: string[] = []
        let paramIndex = 1

        // id (required)
        if (existingCols.has('id')) {
          insertCols.push('"id"')
          placeholders.push(`$${paramIndex++}`)
          values.push(id)
        }

        // name (optional)
        if (existingCols.has('name')) {
          insertCols.push('"name"')
          placeholders.push(`$${paramIndex++}`)
          values.push(name)
        }

        if (existingCols.has('subdomain')) {
          insertCols.push('"subdomain"')
          placeholders.push(`$${paramIndex++}`)
          values.push(subdomain)
        }

        if (existingCols.has('baseCurrency')) {
          insertCols.push('"baseCurrency"')
          placeholders.push(`$${paramIndex++}`)
          values.push(baseCurrency)
        }

        // createdAt / updatedAt: prefer server-side now()
        if (existingCols.has('createdAt')) {
          insertCols.push('"createdAt"')
          placeholders.push('now()')
        }
        if (existingCols.has('updatedAt')) {
          insertCols.push('"updatedAt"')
          placeholders.push('now()')
        }

        if (existingCols.has('id_old')) {
          insertCols.push('"id_old"')
          placeholders.push(`$${paramIndex++}`)
          values.push(idOld)
        }

        // Detect NOT NULL columns without defaults and provide sensible defaults so
        // a minimal INSERT can succeed against legacy schemas that require extra
        // non-null columns (e.g., "status", "type", "isActive", "trialUsed").
        try {
          const colsInfo: Array<{ column_name: string, is_nullable: string, data_type: string, column_default: any }> = (await this.prisma.$queryRaw`
            SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name = 'Tenant'
          `) as any

          const requiredCols = colsInfo.filter(c => c.is_nullable === 'NO' && (c.column_default === null || c.column_default === undefined)).map(c => ({ name: c.column_name, type: c.data_type }))

          // Whitelist of column names allowed in dynamic SQL to prevent any schema-level injection
          const ALLOWED_TENANT_COLUMNS = new Set([
            'id', 'id_old', 'name', 'subdomain', 'baseCurrency', 'status', 'type',
            'isActive', 'trialUsed', 'trialStartsAt', 'trialEndsAt', 'companiesCreated',
            'activeNonOwnerUsersCount', 'activeCompaniesCount', 'activeFirmCount',
            'activeProjectCount', 'createdAt', 'updatedAt', 'deletedAt', 'ownerUserId',
            'maxCompanies', 'practiceTier', 'practiceXp', 'workspace_name', 'workspaceName',
          ])

          for (const rc of requiredCols) {
            if (!ALLOWED_TENANT_COLUMNS.has(rc.name)) continue // skip unknown columns
            if (insertCols.includes(`"${rc.name}"`)) continue
            // Add a reasonable default based on column name or data type
            if (rc.name === 'status') {
              insertCols.push('"status"')
              placeholders.push(`$${paramIndex++}`)
              values.push(status)
            } else if (rc.name === 'type') {
              insertCols.push('"type"')
              placeholders.push(`$${paramIndex++}`)
              values.push('OWNER')
            } else if (rc.name === 'isActive') {
              insertCols.push('"isActive"')
              placeholders.push(`$${paramIndex++}`)
              values.push(true)
            } else if (rc.name === 'trialUsed') {
              insertCols.push('"trialUsed"')
              placeholders.push(`$${paramIndex++}`)
              values.push(false)
            } else if (rc.name === 'companiesCreated') {
              insertCols.push('"companiesCreated"')
              placeholders.push(`$${paramIndex++}`)
              values.push(0)
            } else if (rc.type && (rc.type.includes('timestamp') || rc.type.includes('date'))) {
              insertCols.push(`"${rc.name}"`)
              placeholders.push('now()')
            } else if (rc.type && (rc.type === 'boolean')) {
              insertCols.push(`"${rc.name}"`)
              placeholders.push(`$${paramIndex++}`)
              values.push(false)
            } else if (rc.type && (rc.type.includes('character') || rc.type === 'text' || rc.type === 'varchar')) {
              insertCols.push(`"${rc.name}"`)
              placeholders.push(`$${paramIndex++}`)
              values.push('')
            } else if (rc.type && (rc.type.includes('int') || rc.type === 'integer')) {
              insertCols.push(`"${rc.name}"`)
              placeholders.push(`$${paramIndex++}`)
              values.push(0)
            } else {
              // Fallback: insert empty string for unknown types
              insertCols.push(`"${rc.name}"`)
              placeholders.push(`$${paramIndex++}`)
              values.push('')
            }
          }
        } catch (e) {
          // best-effort only; if this detection fails, proceed with whatever cols
          // we already had and let the INSERT error surface.
          // eslint-disable-next-line no-console
          console.debug('[CompanyRepository] required column detection failed', { message: e?.message })
        }

        if (insertCols.length === 0) {
          throw new Error('No usable Tenant columns found for raw insert')
        }

        const sql = `INSERT INTO public."Tenant" (${insertCols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`
        const rows: any[] = await this.prisma.$queryRawUnsafe(sql, ...values)

        const tenant = rows && rows.length ? rows[0] : null
        // eslint-disable-next-line no-console
        console.debug('[CompanyRepository] tolerant raw INSERT result', { tenant })

        // Create roles (best-effort)
        try {
          if (tenant && tenant.id) await seedDefaultRolesForTenant(tenant.id)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('seedDefaultRolesForTenant failed', e)
        }

        // Backfill (legacy raw insert path): ensure a minimal Company exists
        // Skip backfill if the payload requested suppression
        try {
          if (tenant && tenant.id) {
            if (data && data.suppressCompanyCreation) {
              // eslint-disable-next-line no-console
              console.info('[COMPANY-CREATE] Skipping raw-path Company backfill due to suppressCompanyCreation flag', { workspaceId: tenant.id })
            } else {
              const existing = await this.prisma.company.findFirst({ where: { workspaceId: tenant.id } })
              if (!existing) {
                const created = await this.prisma.company.create({ data: { workspace: { connect: { id: tenant.id } }, name: name || tenant.workspaceName || 'Company', isActive: true } as any })
                // eslint-disable-next-line no-console
                console.info('[COMPANY-CREATE] ✅ Backfilled Company for tenant (raw insert path):', { companyId: created.id, workspaceId: tenant.id })
                try {
                  await this.prisma.workspace.update({ where: { id: tenant.id }, data: { companiesCreated: { increment: 1 } } })
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('[COMPANY-CREATE] Failed to increment companiesCreated (non-fatal):', e?.message || e)
                }
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
    return this.prisma.workspace.findUnique({ where: { id } })
  }

  // Return company only if the userId is a member of the owning tenant
  async findByIdForUser(userId: string, id: string) {
    return this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
        workspace: {
          users: { some: { userId, status: 'ACTIVE' } }
        }
      },
      include: {
        workspace: {
          select: {
            id: true,
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
      try {
        const companies = await this.prisma.company.findMany({
          where: {
            isActive: true,
            workspace: {
              users: { some: { userId, status: 'ACTIVE' } }
            }
          },
          include: {
            workspace: {
              select: {
                id: true,
                users: {
                  where: { userId },
                  select: { isOwner: true, lastAccessedAt: true }
                },
                _count: { select: { users: true } }
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
      } catch (e) {
        // Fallback for inconsistent DB rows: select companies via raw SQL with COALESCE(name,'')
        // eslint-disable-next-line no-console
        console.warn('[COMPANY-QUERY] 🛡️ Default query failed; falling back to raw SQL due to inconsistent DB rows:', e?.message || e)
        const tus = await this.prisma.workspaceUser.findMany({ where: { userId, status: 'ACTIVE' }, select: { workspaceId: true } })
        const tenantIds = tus.map(t => t.workspaceId)
        if (!tenantIds || tenantIds.length === 0) return []
        const rows: any[] = await this.prisma.$queryRawUnsafe('SELECT c.id, c."tenantId", COALESCE(c.name,\'\') as name, c."isActive" FROM public."Company" c WHERE c."tenantId" = ANY($1::uuid[]) AND c."isActive" = true', tenantIds)
        const mapped = rows.map(r => ({ id: r.id, workspaceId: r.tenantid || r.tenantId, name: r.name, isActive: r.isActive }))
        // eslint-disable-next-line no-console
        console.info('[COMPANY-QUERY] ✅ Raw fallback results (no filter):', { count: mapped.length, companies: mapped })
        return mapped
      }
    }

    if (filter === 'owned') {
      // eslint-disable-next-line no-console
      console.info('[COMPANY-QUERY] 🔍 Starting owned query for userId:', userId)
      
      try {
        const companies = await this.prisma.company.findMany({
          where: {
            isActive: true,
            workspace: {
              users: { some: { userId, isOwner: true, status: 'ACTIVE' } }
            }
          },
          include: {
            workspace: {
              select: {
                id: true,
                users: {
                  where: { userId },
                  select: { isOwner: true, lastAccessedAt: true }
                },
                _count: { select: { users: true } }
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
            workspaceId: c.workspaceId,
            isActive: c.isActive,
            tenantUsers: c.workspace?.users 
          })) 
        })
        return unique
      } catch (e) {
        // Defensive fallback: handle rare DB rows where nullable fields violate Prisma schema
        // Gather tenantIds for owned tenants and run a raw query that coalesces null names
        // eslint-disable-next-line no-console
        console.warn('[COMPANY-QUERY] 🛡️ Owned query failed; falling back to raw SQL due to inconsistent DB rows:', e?.message || e)
        const tus = await this.prisma.workspaceUser.findMany({ where: { userId, isOwner: true, status: 'ACTIVE' }, select: { workspaceId: true } })
        const tenantIds = tus.map(t => t.workspaceId)
        if (!tenantIds || tenantIds.length === 0) return []
        const rows: any[] = await this.prisma.$queryRawUnsafe('SELECT c.id, c."tenantId", COALESCE(c.name,\'\') as name, c."isActive" FROM public."Company" c WHERE c."tenantId" = ANY($1::uuid[]) AND c."isActive" = true', tenantIds)
        // Map raw rows into expected shape
        const mapped = rows.map(r => ({ id: r.id, workspaceId: r.workspaceId, name: r.name, isActive: r.isActive }))
        // eslint-disable-next-line no-console
        console.info('[COMPANY-QUERY] ✅ Raw fallback results (owned):', { count: mapped.length, companies: mapped })
        return mapped
      }
    }

    if (filter === 'invited' && email) {
      // Find invites for this email that are pending
      const invites: any[] = await this.prisma.workspaceInvite.findMany({ 
        where: { email, status: 'PENDING' }, 
        select: { workspaceId: true } 
      })
      const tenantIds = invites.map((i) => i.workspaceId)
      if (!tenantIds || !tenantIds.length) return []
      
      const companies = await this.prisma.company.findMany({
        where: {
          isActive: true,
          workspaceId: { in: tenantIds }
        },
        include: {
          workspace: {
            select: {
              id: true,
              _count: { select: { users: true } }
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
        workspace: {
          users: { some: { userId } }
        }
      },
      include: {
        workspace: {
          select: {
            id: true,
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

    // Resolve the workspace/tenant that owns this company and update the user's last-accessed time.
    // Prefer Prisma schema columns (workspaceId) but fall back to raw SQL for legacy schemas.
    let companyTenantId: string | null = null

    try {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: { workspaceId: true },
      })
      companyTenantId = company?.workspaceId ?? null
    } catch (e) {
      // Ignore and fall through to raw SQL fallback below.
      // eslint-disable-next-line no-console
      console.debug('[CompanyRepository] workspaceId lookup failed (fallback to raw SQL):', e?.message)
    }

    if (!companyTenantId) {
      const rows: any[] = await this.prisma.$queryRaw`SELECT "tenantId" FROM public."Company" WHERE "id" = ${companyId} LIMIT 1`
      companyTenantId = rows && rows.length ? ((rows[0] as any).tenantId || (rows[0] as any).tenantid || (rows[0] as any).workspaceId) : null
    }

    if (!companyTenantId) return { success: false }

    const res = await this.prisma.workspaceUser.updateMany({ where: { workspaceId: companyTenantId, userId }, data: { lastAccessedAt: new Date() } })
    return { success: res.count > 0 }
  }

  // Return recent tenants (companies) the user has accessed, ordered by lastAccessedAt desc
  async findRecentForUser(userId: string, limit = 10) {
    if (!userId) return []
    // Use WorkspaceUser.lastAccessedAt to determine the most-recently-used workspace,
    // and then return the companies belonging to those workspaces.
    // This replaces the legacy Tenant/TenantUser tables used in older schemas.
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT c.id, c.name, wu."lastAccessedAt"
      FROM public."Company" c
      JOIN public."WorkspaceUser" wu ON wu."workspaceId" = c."workspaceId"
      WHERE wu."userId" = ${userId}
      ORDER BY wu."lastAccessedAt" DESC NULLS LAST
      LIMIT ${limit}
    `
    return rows || []
  }

  async update(id: string, data: any) {
    return this.prisma.workspace.update({ where: { id }, data })
  }

  // Create a child Company record (for multi-company tenants) and activate
  // the tenant trial (best-effort) when appropriate.
  async createCompanyRecord(data: any) {
    // Normalize incoming name to avoid duplicates caused by trailing/leading whitespace
    const normalizedName = typeof data.name === 'string' ? String(data.name).trim() : data.name

    // eslint-disable-next-line no-console
    console.info('[COMPANY-CHILD-CREATE] 🚀 Starting createCompanyRecord with data:', {
      workspaceId: data.workspaceId,
      name: normalizedName,
      legalName: data.legalName,
      country: data.country,
      allKeys: Object.keys(data)
    })

    // Defensive idempotency: if a company with same tenantId + name (case-insensitive) already exists,
    // return it instead of creating a duplicate. This prevents race/duplicate creation during onboarding.
    try {
      const existing = await this.prisma.company.findFirst({ where: { workspaceId: data.workspaceId, name: { equals: normalizedName, mode: 'insensitive' } } })
      if (existing) {
        console.info('[COMPANY-CHILD-CREATE] ⚠️ Company already exists; returning existing record to avoid duplicate', { companyId: existing.id, name: existing.name })
        return existing
      }
    } catch (e) {
      // If any error occurs, log and continue to attempt create (best-effort)
      console.error('[COMPANY-CHILD-CREATE] Warning: failed to check existing company (continuing to create):', e?.message || e)
    }

    const company = await this.prisma.company.create({ data: { ...data, name: normalizedName } })

    // eslint-disable-next-line no-console
    console.info('[COMPANY-CHILD-CREATE] ✅ Company record created:', {
      companyId: company.id,
      name: company.name,
      workspaceId: company.workspaceId,
      isActive: company.isActive
    })

    // Increment companies created counter
    try {
      await this.prisma.workspace.update({
        where: { id: data.workspaceId },
        data: { companiesCreated: { increment: 1 } }
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[COMPANY-CHILD-CREATE] Failed to increment companiesCreated (non-fatal):', e?.message || e)
    }

    try {
      const tenant = await this.prisma.workspace.findUnique({ where: { id: data.workspaceId } })
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
          console.info('[COMPANY-CHILD-CREATE] Activated trial for tenant', { workspaceId: tenant.id, trialEnds })
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

    // Validate subscription ownership invariants before DB operations
    try {
      const { validateSubscriptionOwnership } = require('./subscription.util')
      validateSubscriptionOwnership(data)
    } catch (ve) {
      // Validation errors should bubble up
      throw ve
    }

    // Check for existing subscription first
    try {
      const existing = await this.prisma.subscription.findUnique({ where: { companyId } })
      if (existing) {
        // Ensure Company.subscriptionId is set
        await this.prisma.company.update({ 
          where: { id: companyId }, 
          data: { subscription: { connect: { id: existing.id } } } 
        }).catch(() => {}) // best-effort
        return existing
      }

      // Attempt to create; if a race occurs (unique constraint), fetch and return existing
      try {
        const created = await this.prisma.subscription.create({ data })
        // Update Company to reference this subscription
        await this.prisma.company.update({ 
          where: { id: companyId }, 
          data: { subscription: { connect: { id: created.id } } } 
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

    const invite = await this.prisma.workspaceInvite.findUnique({ where: { id: inviteId }, include: { role: true } })
    if (!invite) return { success: false, reason: 'invite_not_found' }
    if (invite.status !== 'PENDING') return { success: false, reason: 'invite_not_pending' }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, reason: 'user_not_found' }

    // Only the invited email may accept the invite (unless it's a generic link invite)
    const isLinkInvite = !!invite.isLinkInvite
    if (!isLinkInvite && (invite.email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      return { success: false, reason: 'email_mismatch' }
    }

    // Create tenant user row if missing (avoid upsert to prevent failure when unique constraint is absent)
    try {
      const existing = await this.prisma.workspaceUser.findFirst({
        where: { workspaceId: invite.workspaceId, userId },
      })

      if (existing) {
        await this.prisma.workspaceUser.update({
          where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId } },
          data: { status: 'ACTIVE', roleId: invite.roleId ?? undefined },
        })
      } else {
        const createData: any = {
          workspaceId: invite.workspaceId,
          userId,
          isOwner: false,
          joinedAt: new Date(),
          status: 'ACTIVE',
        }
        if (invite.roleId) createData.roleId = invite.roleId
        await this.prisma.workspaceUser.create({ data: createData })
      }
    } catch (e) {
      // continue but record failure
      console.warn('tenantUser create/update failed', e?.message)
    }

    // Mark invite accepted
    await this.prisma.workspaceInvite.update({ where: { id: inviteId }, data: { status: 'ACCEPTED', acceptedAt: new Date() } })

    // Decide whether to mark user as accountant
    let shouldSetAccountant = setIsAccountant
    if (!shouldSetAccountant && invite.role && invite.role.name) {
      const rn = invite.role.name.toLowerCase()
      if (rn.includes('accountant')) shouldSetAccountant = true
    }

    if (shouldSetAccountant) {
      try {
        // Setting accountant flag omitted; schema no longer supports direct flag update here
      } catch (e) {
        // ignore
      }
    }

    return { success: true, redirect: '/dashboard' }
  }
}
