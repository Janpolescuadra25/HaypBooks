import { PrismaClient } from '@prisma/client'
// Prefer native bcrypt when available, otherwise fall back to bcryptjs to avoid native build issues in dev/test environments.
let bcrypt: any
try { bcrypt = require('bcrypt') } catch (e) { bcrypt = require('bcryptjs') }
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return String(error)
}

async function hasColumn(table: string, column: string) {
  const res: Array<{ exists: boolean }> = await prisma.$queryRaw`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name=${column}) as exists` as any
  return res[0]?.exists === true
}

async function main() {
  console.log('Seeding database...')

  // Demo user (raw upsert to remain compatible while Prisma client is being regenerated)
  const passwordHash = await bcrypt.hash('password', 10)
  const demoUserId = require('crypto').randomUUID()
  await prisma.$executeRaw`INSERT INTO public."User" ("id","email","name","passwordhash","isemailverified","createdAt","updatedAt") VALUES (${ demoUserId }, ${ 'demo@haypbooks.test' }, ${ 'Demo User' }, ${ passwordHash }, ${ true }, now(), now()) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name", "passwordhash" = EXCLUDED."passwordhash", "isemailverified" = EXCLUDED."isemailverified";`
  const users = await prisma.$queryRaw<any[]>`SELECT id, email, name, "isemailverified" as "isEmailVerified", "createdAt", "updatedAt" FROM public."User" WHERE email = ${ 'demo@haypbooks.test' } LIMIT 1;`
  const user = Array.isArray(users) && users.length ? users[0] : undefined

  // Demo workspace: use a deterministic id for local/dev seeds
  const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000001'
  const tenantId = DEMO_TENANT_ID
  // Try to create a Workspace record using the Prisma client (preferred). If the DB schema is still
  // legacy and doesn't have Workspace, fall back to raw Tenant INSERTs.
  // Use ownerUserId (@unique) as the conflict target — more reliable than id when re-seeding.
  try {
    await prisma.workspace.upsert({ where: { ownerUserId: user.id }, update: { baseCurrency: 'USD' }, create: { id: tenantId, ownerUserId: user.id, baseCurrency: 'USD' } as any })
  } catch (eUpsert) {
    console.warn('[seed] prisma.workspace.upsert failed:', errorMessage(eUpsert))
    try {
      await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}, ${'USD'}, now(), now()) ON CONFLICT ("id") DO UPDATE SET "baseCurrency" = EXCLUDED."baseCurrency";`
    } catch (e2) {
      // ignore — subsequent SELECT will fetch existing row
    }
  }

  // Lookup workspace/tenant row (handle both new and legacy tables)
  let tenant: any
  try {
    // Use ownerUserId so we find the workspace even when the id differs from DEMO_TENANT_ID
    tenant = await prisma.workspace.findUnique({ where: { ownerUserId: user.id } }) as any
  } catch (e) {
    // ignore if Workspace model/table doesn't exist yet
  }

  if (!tenant) {
    // Legacy SELECT path — Tenant table may not exist in modern schemas; wrap entirely.
    try {
      const tenants = await prisma.$queryRaw<any[]>`SELECT id, "baseCurrency" FROM public."Tenant" WHERE CAST(id AS text) = ${DEMO_TENANT_ID} LIMIT 1;`
      tenant = tenants && tenants.length ? tenants[0] : undefined
      if (!tenant) {
        const fallbackTenantId = DEMO_TENANT_ID
        await prisma.$executeRaw`INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES (CAST(${fallbackTenantId} AS uuid), now(), now())`;
        const tenants2 = await prisma.$queryRaw<any[]>`SELECT id, "baseCurrency" FROM public."Tenant" WHERE id = CAST(${DEMO_TENANT_ID} AS uuid) LIMIT 1;`
        tenant = tenants2 && tenants2.length ? tenants2[0] : undefined
      }
    } catch (eTenantTable) {
      // Tenant table doesn't exist (modern schema uses Workspace only) — raw Workspace fallback
      console.warn('[seed] Legacy Tenant table not found, attempting raw Workspace fallback:', errorMessage(eTenantTable))
      try {
        // Workspace.id and Workspace.ownerUserId are TEXT columns (Prisma String) — no ::uuid cast needed.
        // Use ON CONFLICT (id) so a re-seed with the same DEMO id is idempotent.
        await prisma.$executeRaw`INSERT INTO public."Workspace" ("id","ownerUserId","baseCurrency","createdAt","updatedAt") VALUES (${tenantId}, ${user.id}, 'USD', now(), now()) ON CONFLICT ("id") DO UPDATE SET "baseCurrency" = 'USD';`
        const rows = await prisma.$queryRaw<any[]>`SELECT id, "baseCurrency" FROM public."Workspace" WHERE "ownerUserId" = ${user.id} LIMIT 1;`
        tenant = rows && rows.length ? rows[0] : undefined
      } catch (eWs) {
        console.warn('[seed] Raw Workspace fallback failed:', errorMessage(eWs))
      }
    }
  }

  // Link user to workspace/tenant (best-effort — table and column availability vary per DB state)
  try {
  const tenantUserHasStatus = await hasColumn('TenantUser', 'status')
  const tenantUserHasRoleId = await hasColumn('TenantUser', 'roleId')
  const tenantUserHasInvitedBy = await hasColumn('TenantUser', 'invitedBy')
  if (tenantUserHasStatus && tenantUserHasRoleId && tenantUserHasInvitedBy) {
    try {
      await prisma.workspaceUser.upsert({
        where: { workspaceId_userId: { workspaceId: tenant.id, userId: user.id } },
        update: {},
        create: { workspace: { connect: { id: tenant.id } }, user: { connect: { id: user.id } }, isOwner: true, lastAccessedAt: new Date() }
      })
    } catch (e) {
      // Some intermediate migration states require setting legacy tenantId_old; perform a raw upsert directly.
      console.warn('workspaceUser.upsert failed; attempting raw TenantUser upsert as fallback', errorMessage(e))
      try {
        const updated = await prisma.$executeRawUnsafe('UPDATE public."TenantUser" SET "role" = $3, "isOwner" = $4, "lastAccessedAt" = now() WHERE "tenantId" = $1::uuid AND "userId" = $2', tenant.id, user.id, 'ADMIN', true)
        if (!updated) {
          // Use adaptive raw insert that will set tenant/workspace-like columns appropriately across mixed schemas
          const tu = await rawInsertWithTenantFallback('TenantUser', { userId: user.id, role: 'ADMIN', isOwner: true }, { col: 'userId', val: user.id })
          if (!tu) {
            console.warn('raw TenantUser adaptive insert failed')
          }
        }
      } catch (e2) {
        console.warn('raw TenantUser upsert fallback failed', errorMessage(e2))
      }
    }
  } else {
    // Use raw upsert when DB doesn't have schema column yet (avoid Prisma selecting missing columns)
    try {
      await prisma.$executeRawUnsafe('INSERT INTO public."TenantUser" ("tenantId","userId","role","isOwner","joinedAt","lastAccessedAt") VALUES ($1::uuid,$2::uuid,$3,$4,now(),now()) ON CONFLICT ("tenantId","userId") DO UPDATE SET "role" = EXCLUDED."role", "isOwner" = EXCLUDED."isOwner", "lastAccessedAt" = COALESCE(public."TenantUser"."lastAccessedAt", EXCLUDED."lastAccessedAt")', tenant.id, user.id, 'ADMIN', true)
    } catch (eTU) {
      // TenantUser table doesn't exist (modern schema uses WorkspaceUser); attempt raw WorkspaceUser insert
      console.warn('[seed] TenantUser raw insert failed, trying WorkspaceUser fallback:', errorMessage(eTU))
      try {
        await prisma.$executeRawUnsafe(
          'INSERT INTO public."WorkspaceUser" ("workspaceId","userId","isOwner","joinedAt","lastAccessedAt","createdAt","updatedAt") VALUES ($1,$2,$3,now(),now(),now(),now()) ON CONFLICT ("workspaceId","userId") DO UPDATE SET "isOwner" = $3, "lastAccessedAt" = now()',
          tenant.id, user.id, true
        )
      } catch (eWU) {
        console.warn('[seed] WorkspaceUser raw insert fallback failed (non-fatal):', errorMessage(eWU))
      }
    }
  }
  } catch (eLinkUser) {
    console.warn('[seed] Linking demo user to workspace failed (non-fatal):', errorMessage(eLinkUser))
  }

    // Create a default company for the demo tenant

    // Helper: create a minimal Company row by inspecting required NOT NULL columns and filling defensible defaults
    async function createMinimalCompanyRow(tenantId: string) {
      const cols: any[] = await prisma.$queryRaw`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='Company'` as any
      const required = cols.filter((c: any) => c.is_nullable === 'NO')
      const params: any[] = []
      const colNames: string[] = []
      const exprs: string[] = []
      const crypto = require('crypto')

      // Helper to ensure a Country row exists and return its id
      async function ensureCountryExists() {
        try {
          let rows: any[] = await prisma.$queryRaw`SELECT id FROM public."Country" LIMIT 1;` as any[]
          if (rows && rows.length) return rows[0].id
          // Try inserting minimal country (most schemas have defaults for id)
          try {
            await prisma.$executeRawUnsafe('INSERT INTO public."Country" ("name","code") VALUES ($1,$2)', 'Demo Country', 'DM')
          } catch (e) {
            // Try with explicit uuid id if the table expects uuid
            const cid = crypto.randomUUID()
            try {
              await prisma.$executeRawUnsafe('INSERT INTO public."Country" ("id","name","code") VALUES ($1::uuid,$2,$3)', cid, 'Demo Country', 'DM')
            } catch (e2) {
              console.warn('Failed to create minimal Country row', errorMessage(e2))
              return undefined
            }
            return cid
          }
          rows = await prisma.$queryRaw`SELECT id FROM public."Country" LIMIT 1;` as any[]
          return rows && rows.length ? rows[0].id : undefined
        } catch (e) {
          console.warn('ensureCountryExists failed', errorMessage(e))
          return undefined
        }
      }



      // Build required-column values for Company
      for (const c of required) {
        const name = c.column_name
        // Prefer deterministic or safe defaults depending on the column
        if (name === 'id') {
          if (c.data_type === 'uuid') {
            colNames.push('"id"')
            params.push(crypto.randomUUID())
            exprs.push(`$${params.length}::uuid`)
          } else {
            colNames.push('"id"')
            params.push('company-' + tenantId)
            exprs.push(`$${params.length}`)
          }
        } else if (name.toLowerCase().includes('tenant') || name.toLowerCase().includes('workspace')) {
          colNames.push(`"${name}"`)
          if (c.data_type === 'uuid') {
            params.push(tenantId)
            exprs.push(`$${params.length}::uuid`)
          } else {
            params.push(tenantId)
            exprs.push(`$${params.length}`)
          }
        } else if (name === 'name') {
          colNames.push('"name"')
          params.push('Demo Company')
          exprs.push(`$${params.length}`)
        } else if (name.toLowerCase().includes('country')) {
          // Ensure we have a Country row to satisfy FK
          const countryId = await ensureCountryExists()
          if (countryId) {
            colNames.push(`"${name}"`)
            if (c.data_type === 'uuid') {
              params.push(countryId)
              exprs.push(`$${params.length}::uuid`)
            } else {
              params.push(countryId)
              exprs.push(`$${params.length}`)
            }
          } else {
            // If we can't ensure a country, provide empty string (will likely cause insert to fail and be caught)
            colNames.push(`"${name}"`)
            params.push('')
            exprs.push(`$${params.length}`)
          }
        } else if (name === 'createdAt' || name === 'updatedAt' || name === 'joinedAt') {
          colNames.push(`"${name}"`)
          exprs.push('now()')
        } else if (c.data_type === 'boolean') {
          colNames.push(`"${name}"`)
          params.push(false)
          exprs.push(`$${params.length}`)
        } else if (['numeric','double precision','real','integer'].includes(c.data_type)) {
          colNames.push(`"${name}"`)
          params.push(0)
          exprs.push(`$${params.length}`)
        } else {
          // default to empty string for other required textual columns
          colNames.push(`"${name}"`)
          params.push('')
          exprs.push(`$${params.length}`)
        }
      }

      if (!colNames.length) return undefined

      const sql = `INSERT INTO public."Company" (${colNames.join(',')}) VALUES (${exprs.join(',')}) ON CONFLICT ("id") DO NOTHING;`
      try {
        await prisma.$executeRawUnsafe(sql, ...params)
        // Prefer selecting by id when we set it
        const idIndex = colNames.indexOf('"id"')
        if (idIndex !== -1) {
          const idVal = params[idIndex]
          const idCol = required.find((c: any) => c.column_name === 'id')
          if (idCol && idCol.data_type === 'uuid') {
            const rows = await prisma.$queryRaw`SELECT * FROM public."Company" WHERE id = CAST(${idVal} AS uuid) LIMIT 1;` as any[]
            return rows && rows.length ? rows[0] : undefined
          } else {
            const rows = await prisma.$queryRaw`SELECT * FROM public."Company" WHERE id = ${idVal} LIMIT 1;` as any[]
            return rows && rows.length ? rows[0] : undefined
          }
        }
        // Fallback: select by name
        const rows2 = await prisma.$queryRaw`SELECT * FROM public."Company" WHERE "name" = ${'Demo Company'} LIMIT 1;` as any[]
        return rows2 && rows2.length ? rows2[0] : undefined
      } catch (e) {
        console.warn('adaptive company insert failed', errorMessage(e))
        return undefined
      }
    }

    // Generic helper: insert a minimal row into a table and ensure all tenant/workspace-like columns and required NOT NULL columns are set when needed
    async function rawInsertWithTenantFallback(table: string, data: Record<string, any>, uniqueWhere?: { col: string, val: any }) {
      try {
        // Include udt_name so we can cast user-defined types (enums)
        const cols: any[] = await prisma.$queryRaw`SELECT column_name, data_type, is_nullable, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name=${table}` as any[]
        const availableCols = new Set(cols.map(c => c.column_name.toLowerCase()))
        const tenantCols = cols.filter(c => /tenant/i.test(c.column_name) || /workspace/i.test(c.column_name))
        const requiredCols = cols.filter(c => c.is_nullable === 'NO')
        const colNames: string[] = []
        const exprs: string[] = []
        const params: any[] = []
        const crypto = require('crypto')

        // include only requested data columns that actually exist in the table
        for (const [k, v] of Object.entries(data)) {
          if (!availableCols.has(k.toLowerCase())) {
            // Skip keys not present in the target table schema
            continue
          }
          const colMeta = cols.find(c => c.column_name.toLowerCase() === k.toLowerCase())
          colNames.push(`"${colMeta.column_name}"`)
          params.push(v)
          // handle user-defined types (enums)
          if (colMeta.data_type === 'USER-DEFINED' && colMeta.udt_name) {
            exprs.push(`$${params.length}::"${colMeta.udt_name}"`)
          } else if (colMeta.data_type === 'uuid') {
            exprs.push(`$${params.length}::uuid`)
          } else {
            exprs.push(`$${params.length}`)
          }
        }

        // include all tenant-like columns if present and not provided in data
        for (const tcol of tenantCols) {
          const tname = tcol.column_name
          const alreadyProvided = colNames.some(cn => cn.replace(/\"/g, '').toLowerCase() === tname.toLowerCase())
          if (alreadyProvided) continue
          colNames.push(`"${tname}"`)
          if (tcol.data_type === 'uuid') {
            params.push(tenant.id)
            exprs.push(`$${params.length}::uuid`)
          } else {
            params.push(tenant.id)
            exprs.push(`$${params.length}`)
          }
        }

        // For USER-DEFINED types (enums), pick the first defined enum label as a safe default
        async function enumDefaultLabel(udt: string) {
          try {
            const rows: any[] = await prisma.$queryRawUnsafe('SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1) ORDER BY enumsortorder LIMIT 1', udt)
            return rows && rows.length ? rows[0].enumlabel : undefined
          } catch (e) {
            return undefined
          }
        }

        const enumDefaults: Record<string, string | undefined> = {}
        for (const r of requiredCols.filter(rc => rc.data_type === 'USER-DEFINED' && rc.udt_name)) {
          enumDefaults[r.udt_name] = await enumDefaultLabel(r.udt_name)
        }

        // ensure other required NOT NULL columns are present with sensible defaults (only for columns that exist)
        for (const r of requiredCols) {
          const name = r.column_name
          const alreadyProvided = colNames.some(cn => cn.replace(/\"/g, '').toLowerCase() === name.toLowerCase())
          if (alreadyProvided) continue

          // If createdAt/updatedAt/joinedAt: use now()
          if (['createdAt', 'updatedAt', 'joinedAt'].includes(name)) {
            colNames.push(`"${name}"`)
            exprs.push('now()')
            continue
          }

          if (name === 'id') {
            colNames.push(`"id"`)
            if (r.data_type === 'uuid') {
              const id = crypto.randomUUID()
              params.push(id)
              exprs.push(`$${params.length}::uuid`)
            } else {
              const id = `${table.toLowerCase()}-${tenant.id}-${Math.random().toString(36).slice(2,8)}`
              params.push(id)
              exprs.push(`$${params.length}`)
            }
            continue
          }

          // booleans -> false, numerics -> 0, text -> empty string
          if (r.data_type === 'boolean') {
            colNames.push(`"${name}"`)
            params.push(false)
            exprs.push(`$${params.length}`)
            continue
          }
          if (['numeric', 'double precision', 'real', 'integer'].includes(r.data_type)) {
            colNames.push(`"${name}"`)
            params.push(0)
            exprs.push(`$${params.length}`)
            continue
          }

          // user-defined types: use first enum label if available
          if (r.data_type === 'USER-DEFINED' && r.udt_name) {
            const label = enumDefaults[r.udt_name]
            if (label) {
              colNames.push(`"${name}"`)
              params.push(label)
              exprs.push(`$${params.length}::"${r.udt_name}"`)
              continue
            }
          }

          // default fallback for other text-like required columns
          colNames.push(`"${name}"`)
          params.push('')
          exprs.push(`$${params.length}`)
        }

        if (!colNames.length) return undefined

        const sql = `INSERT INTO public."${table}" (${colNames.join(',')}) VALUES (${exprs.join(',')}) ON CONFLICT DO NOTHING;`
        await prisma.$executeRawUnsafe(sql, ...params)

        // Return inserted/selected row if uniqueWhere provided
        if (uniqueWhere) {
          // prefer parameterized select on unique column
          const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM public."${table}" WHERE "${uniqueWhere.col}" = $1 LIMIT 1`, uniqueWhere.val)
          return rows && rows.length ? rows[0] : undefined
        }

        // otherwise return any row that matches provided data keys (best-effort: use first provided column)
        const firstCol = Object.keys(data).find(k => availableCols.has(k.toLowerCase()))
        if (firstCol) {
          const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM public."${table}" WHERE "${firstCol}" = $1 LIMIT 1`, data[firstCol])
          return rows && rows.length ? rows[0] : undefined
        }
        return undefined
      } catch (e) {
        console.warn('rawInsertWithTenantFallback failed for', table, errorMessage(e))
        return undefined
      }
    }

    // Coerce a foreign id value for a target table/column based on that column's data_type.
    // Returns the original id when types match or null when the target column expects uuid but the
    // provided id is non-UUID (avoids FK failures during mixed-schema seeds).
    async function coerceForeignIdForTable(table: string, column: string, id: string | undefined) {
      if (!id) return null
      try {
        const colInfo: any[] = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name=${column}` as any
        if (!colInfo || !colInfo.length) return id
        const dt = colInfo[0].data_type
        const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(id)
        if (dt === 'uuid' && !looksLikeUuid) return null
        return id
      } catch (e) {
        return id
      }
    }

    const companyHasTenantId = await hasColumn('Company', 'tenantId')
    let demoCompany: any
    if (companyHasTenantId) {
      try {
        // Prefer a simple lookup first to avoid Prisma create/upsert requiring nested relations
        demoCompany = await prisma.company.findFirst({ where: { workspaceId: tenant.id, name: 'Demo Company' } }).catch(() => undefined)
        if (!demoCompany) {
          try {
            // Try a pragmatic scalar-only create; if the generated client requires nested relations
            // (varies during schema migrations), fall back to the adaptive raw insert helper.
            demoCompany = await prisma.company.create({ data: { workspaceId: tenant.id, name: 'Demo Company' } as any })
          } catch (e1) {
            console.warn('Prisma company.create failed; attempting adaptive raw INSERT for demo company', errorMessage(e1))
            demoCompany = await createMinimalCompanyRow(tenant.id)
            if (!demoCompany) {
              console.warn('Adaptive raw INSERT for Company failed; skipping demo company creation')
            }
          }
        }
      } catch (e) {
        console.warn('Error during company lookup/creation, falling back to adaptive raw INSERT', errorMessage(e))
        demoCompany = await createMinimalCompanyRow(tenant.id)
      }
    } else {
      // Older DB without tenantId on Company: attempt adaptive insert that covers required columns and types
      demoCompany = await createMinimalCompanyRow(tenant.id)
      if (!demoCompany) {
        // Fallback to best-effort id+name insert (legacy)
        await prisma.$executeRaw`INSERT INTO public."Company" ("id","name") VALUES (${ 'company-' + tenant.id }, ${'Demo Company'}) ON CONFLICT ("id") DO NOTHING;`
        const rows: any[] = await prisma.$queryRaw`SELECT id, name FROM public."Company" WHERE id = ${ 'company-' + tenant.id } LIMIT 1;`
        demoCompany = rows && rows.length ? rows[0] : undefined
      }
    }

  // 🧾 Practice Hub seed data: demo practice / practice user / accounting firm / client access
  try {
    const practiceId = `practice-${tenant.id}`

    const practice = await prisma.practice.upsert({
      where: { id: practiceId },
      update: { name: 'Demo Accounting Firm', servicesOffered: 'Bookkeeping, Tax, Advisory', workspaceId: tenant.id },
      create: { id: practiceId, workspaceId: tenant.id, name: 'Demo Accounting Firm', servicesOffered: 'Bookkeeping, Tax, Advisory' },
    })

    await prisma.practiceUser.upsert({
      where: { practiceId_workspaceId_userId: { practiceId: practice.id, workspaceId: tenant.id, userId: user.id } },
      update: {},
      create: { practiceId: practice.id, workspaceId: tenant.id, userId: user.id },
    })

    let accountingFirm = await prisma.accountingFirm.findFirst({ where: { workspaceId: tenant.id } })
    if (!accountingFirm) {
      accountingFirm = await prisma.accountingFirm.create({ data: { workspaceId: tenant.id, name: 'Demo Accounting Firm' } })
    } else {
      // Keep it in sync with practice name if already exists
      accountingFirm = await prisma.accountingFirm.update({ where: { id: accountingFirm.id }, data: { name: 'Demo Accounting Firm' } })
    }

    if (demoCompany && accountingFirm) {
      await prisma.companyFirmAccess.upsert({
        where: { companyId_accountingFirmId: { companyId: demoCompany.id, accountingFirmId: accountingFirm.id } },
        update: { status: 'ACCEPTED', role: 'ADMIN', acceptedAt: new Date() },
        create: {
          workspaceId: tenant.id,
          companyId: demoCompany.id,
          accountingFirmId: accountingFirm.id,
          role: 'ADMIN',
          status: 'ACCEPTED',
          invitedAt: new Date(),
          acceptedAt: new Date(),
        },
      })
    }

    console.log('[seed] Practice Hub sample data seeded: practice+practiceUser+accountingFirm+companyFirmAccess')
  } catch (e) {
    console.warn('[seed] Practice Hub sample seeding failed (non-fatal):', errorMessage(e))
  }

  // Ensure some AccountTypes exist
  const assetType = await prisma.accountType.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'ASSET' } })
  const expenseType = await prisma.accountType.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'EXPENSE' } })
  const incomeType = await prisma.accountType.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: 'INCOME' } })
  const liabilityType = await prisma.accountType.upsert({ where: { id: 4 }, update: {}, create: { id: 4, name: 'LIABILITY' } })
  const equityType = await prisma.accountType.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: 'EQUITY' } })

  if (!demoCompany) {
    console.warn('Skipping company-scoped demo seeds because demo company could not be created')
  } else {
    // Create some default Accounts for the tenant
    const cash = await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "1000" } }, update: {}, create: { companyId: demoCompany.id, code: "1000", name: 'Cash', typeId: assetType.id } })
  const ar = await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "1100" } }, update: {}, create: { companyId: demoCompany.id, code: "1100", name: 'Accounts Receivable', typeId: assetType.id } })
  const rev = await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "4000" } }, update: {}, create: { companyId: demoCompany.id, code: "4000", name: 'Service Revenue', typeId: incomeType.id } })
  const invSuspense = await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "INV-SUSPENSE" } }, update: {}, create: { companyId: demoCompany.id, code: "INV-SUSPENSE", name: 'Inventory Suspense', typeId: expenseType.id } })

  // Create a contact and customer (tenant-scoped) — be tolerant of intermediate tenant->workspace column names
  let contact = await prisma.contact.findFirst({ where: { workspaceId: tenant.id, displayName: 'Acme Corp' } })
  if (!contact) {
    try {
      contact = await prisma.contact.create({ data: { workspaceId: tenant.id, type: 'CUSTOMER', displayName: 'Acme Corp' } })
    } catch (e) {
      console.warn('Prisma contact.create failed; attempting raw INSERT with tenant-like column', errorMessage(e))
      contact = await rawInsertWithTenantFallback('Contact', { type: 'CUSTOMER', displayName: 'Acme Corp' }, { col: 'displayName', val: 'Acme Corp' }) as any
      if (!contact) console.warn('raw Contact insert fallback failed or did not create a row')
    }
  }
  if (contact) {
    let customer: any
    try {
      customer = await prisma.customer.upsert({ where: { contactId: contact.id }, update: {}, create: { contactId: contact.id, workspaceId: tenant.id } })
    } catch (e) {
      console.warn('prisma.customer.upsert failed; attempting raw INSERT fallback', errorMessage(e))
      customer = await rawInsertWithTenantFallback('Customer', { contactId: contact.id, companyId: demoCompany?.id }, { col: 'contactId', val: contact.id })
      if (!customer) console.warn('raw Customer insert fallback failed')
    }

    try {
      await prisma.contactEmail.upsert({ where: { contactId_email: { contactId: contact.id, email: `${contact.id}@acme.example` } }, update: {}, create: { contactId: contact.id, email: `${contact.id}@acme.example`, type: 'WORK', isPrimary: true } })
    } catch (e) { /* table may not exist yet if migrations not applied */ }

    try {
      const existingPhone = await prisma.contactPhone.findFirst({ where: { contactId: contact.id, phone: '+10000000000' } })
      if (!existingPhone) {
        try {
          await prisma.contactPhone.create({ data: { contactId: contact.id, phone: '+10000000000', type: 'WORK', isPrimary: true } })
        } catch (e) {
          // attempt raw fallback
          await rawInsertWithTenantFallback('ContactPhone', { contactId: contact.id, phone: '+10000000000', type: 'WORK', isPrimary: true }, { col: 'phone', val: '+10000000000' })
        }
      }
    } catch (e) { /* table may not exist yet if migrations not applied */ }

    // Create an invoice for the customer - include required fields (balance, total)
    let invoice: any
    try {
      invoice = await prisma.invoice.create({ data: { workspaceId: tenant.id, companyId: demoCompany?.id ?? null, customerId: contact.id, invoiceNumber: 'INV-1001', date: new Date(), dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), totalAmount: 1000, balance: 1000, status: 'SENT' } })
      await prisma.invoiceLine.create({ data: { workspaceId: tenant.id, invoiceId: invoice.id, companyId: demoCompany?.id ?? null, description: 'Consulting services', quantity: 1, unitPrice: 1000, totalPrice: 1000 } })
      console.log('Seeded demo tenant, tenant user, accounts, customer, and invoice')
    } catch (e) {
      console.warn('prisma.invoice.create failed; attempting raw INSERT fallback', errorMessage(e))
      // Coerce company id into the appropriate shape for Invoice table (some schemas expect uuid)
      const invoiceCompanyId = await coerceForeignIdForTable('Invoice', 'companyId', demoCompany?.id)
      const insertedInvoice = await rawInsertWithTenantFallback('Invoice', { companyId: invoiceCompanyId, customerId: contact.id, invoiceNumber: 'INV-1001', issuedAt: new Date(), date: new Date(), dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), total: 1000, balance: 1000 }, { col: 'invoiceNumber', val: 'INV-1001' })
      if (insertedInvoice) {
        // Insert invoice line via raw fallback to avoid Prisma create issues during mixed migrations
        const invoiceLineCompanyId = await coerceForeignIdForTable('InvoiceLine', 'companyId', demoCompany?.id)
        const insertedLine = await rawInsertWithTenantFallback('InvoiceLine', { invoiceId: insertedInvoice.id, companyId: invoiceLineCompanyId, description: 'Consulting services', quantity: 1, unitPrice: 1000, totalPrice: 1000 }, { col: 'invoiceId', val: insertedInvoice.id })
        if (!insertedLine) console.warn('Failed to insert InvoiceLine for invoice', insertedInvoice.id)
        console.log('Seeded demo tenant, tenant user, accounts, customer, and invoice (raw fallback)')
      } else {
        console.warn('Skipping invoice seed, table or column may not exist yet', e)
      }
    }
  } else {
    console.warn('Skipping contact/customer scoped seeds because contact could not be created')
  }

  // Seed sample Tasks if migrations applied
  try {
    const taskTableExists = await hasColumn('Task', 'id')
    if (taskTableExists) {
      const existing = await prisma.task.findFirst({ where: { workspaceId: tenant.id } })
      if (!existing) {
        // Be defensive about companyId types: some legacy DBs use non-UUID company ids (e.g. 'company-...'),
        // while Task.companyId column may be defined as UUID. If types mismatch, insert null for companyId.
        const companyColumnIsUuid = (await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Task' AND column_name='companyId'`) as any
        let companyIdToInsert: string | null = null
        if (demoCompany?.id) {
          const isUuidColumn = companyColumnIsUuid && companyColumnIsUuid.length && (companyColumnIsUuid[0] as any).data_type === 'uuid'
          const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(demoCompany.id)
          companyIdToInsert = isUuidColumn && !looksLikeUuid ? null : demoCompany.id
        }
        const t1 = await prisma.task.create({ data: { workspaceId: tenant.id, companyId: companyIdToInsert, title: 'Welcome: get started', description: 'A sample task for your demo tenant', status: 'PENDING', priority: 'MEDIUM', createdById: user.id } })
        await prisma.taskComment.create({ data: { taskId: t1.id, userId: user.id, comment: 'This is a demo comment' } })
      }
    }
  } catch (e) { console.warn('Skipping task seed; Task table may not exist yet', e) }
  // Create a sample CustomerCredit for demo (if table exists) — only if contact was created
  if (contact) {
    try {
      await prisma.customerCredit.create({ data: { workspaceId: tenant.id, companyId: demoCompany?.id ?? null, customerId: contact.id, creditNumber: 'CRED-1001', total: 100.00, balance: 100.00, status: 'ISSUED' } })
      console.log('Seeded sample CustomerCredit (if migrations applied)')
    } catch (e) { /* safe ignore if table missing */ }
  } else {
    console.warn('Skipping CustomerCredit seed because contact was not created')
  }

  // Seed basic governance and configuration for demo tenant
  try {
    await prisma.accountingPeriod.upsert({ where: { id: `period-${tenant.id}` }, update: {}, create: { id: `period-${tenant.id}`, workspaceId: tenant.id, startDate: new Date(new Date().getFullYear(), 0, 1), endDate: new Date(new Date().getFullYear(), 11, 31), status: 'OPEN' } })
  } catch (e) {
    console.warn('accountingPeriod.upsert failed; attempting raw insert with tenant fallback', errorMessage(e))
    const ap = await rawInsertWithTenantFallback('AccountingPeriod', { id: `period-${tenant.id}`, workspaceId: tenant.id, startDate: new Date(new Date().getFullYear(), 0, 1), endDate: new Date(new Date().getFullYear(), 11, 31), status: 'OPEN' }, { col: 'id', val: `period-${tenant.id}` })
    if (!ap) console.warn('Skipping accountingPeriod seed, table or column may not exist yet')
  }
  // Ensure 'ADMIN' role exists using fallback raw SQL for legacy DBs
  let role: any = await prisma.role.findFirst({ where: { workspaceId: tenant.id, name: 'ADMIN' } }).catch(() => undefined as any)
  if (!role) {
    try {
      role = await prisma.role.create({ data: { workspaceId: tenant.id, name: 'ADMIN' } })
    } catch (e) {
      console.warn('Prisma role.create failed, attempting raw INSERT (legacy DB)', errorMessage(e))
      role = await rawInsertWithTenantFallback('Role', { name: 'ADMIN' }, { col: 'name', val: 'ADMIN' }) as any
      if (!role) console.warn('Raw role insert fallback failed')
    }
  }
  const permissionHasKey = await hasColumn('Permission', 'key')
  let permission: any
  if (permissionHasKey) {
    permission = await prisma.permission.upsert({ where: { key: 'manage:all' }, update: {}, create: { key: 'manage:all', desc: 'Full access for admins' } }).catch(() => undefined as any)
    // Add recommended permissions for tasks and attachments
    await prisma.permission.upsert({ where: { key: 'tasks:read' }, update: {}, create: { key: 'tasks:read', desc: 'Read tasks' } }).catch(() => {})
    await prisma.permission.upsert({ where: { key: 'tasks:write' }, update: {}, create: { key: 'tasks:write', desc: 'Create/update tasks' } }).catch(() => {})
    await prisma.permission.upsert({ where: { key: 'attachments:upload' }, update: {}, create: { key: 'attachments:upload', desc: 'Upload attachments' } }).catch(() => {})
  } else {
    await prisma.$executeRaw`INSERT INTO public."Permission" ("key","desc") VALUES (${ 'manage:all' }, ${ 'Full access for admins' }) ON CONFLICT ("key") DO NOTHING;`
    const rows: any[] = await prisma.$queryRaw`SELECT key, desc FROM public."Permission" WHERE key = ${ 'manage:all' } LIMIT 1;`
    permission = rows && rows.length ? rows[0] : undefined
  }
  try {
    if (role && permission) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } }).catch(() => {})
      // Attach recommended permissions to ADMIN role
      const perms = await prisma.permission.findMany({ where: { key: { in: ['tasks:read','tasks:write','attachments:upload'] } } })
      for (const p of perms) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } }).catch(() => {})
      }
    }
  } catch (e) { /* ignore errors in case of duplicate or type mismatch */ }

  // Update TenantUser record to reference roleId (use raw SQL if Prisma fails due to schema mismatch)
  if (role && role.id) {
    try {
      await prisma.workspaceUser.update({ where: { workspaceId_userId: { workspaceId: tenant.id, userId: user.id } }, data: { roleId: role.id } }).catch(() => {})
    } catch (e) {
      console.warn('tenantUser.update failed via Prisma; attempting raw SQL for legacy schema')
      const tuColType = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='tenantId'` as any
      const tuTenantIsUuid = tuColType && tuColType.length && (tuColType[0] as any).data_type === 'uuid'
      if (tuTenantIsUuid) {
        await prisma.$executeRaw`UPDATE public."TenantUser" SET "roleId" = ${role.id} WHERE "tenantId" = CAST(${tenant.id} AS uuid) AND "userId" = ${user.id}`
      } else {
        await prisma.$executeRaw`UPDATE public."TenantUser" SET "roleId" = ${role.id} WHERE CAST("tenantId" AS text) = ${tenant.id.toString()} AND "userId" = ${user.id}`
      }
    }
  }

  // Create a demo TenantInvite (if migrations applied)
  try {
    await prisma.workspaceInvite.create({ data: { workspaceId: tenant.id, email: `invitee@demo-tenant.example`, roleId: role && role.id ? role.id : null, invitedBy: user.id, status: 'PENDING', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } })
    console.log('Seeded a sample TenantInvite (if migrations applied)')
  } catch (e) { /* ignore if migrations not applied or record exists */ }



  // Create some example AccountSubTypes for tenant (if not exists)
  const subtype1 = await prisma.accountSubType.findFirst({ where: { companyId: demoCompany.id, name: 'CURRENT_ASSET', typeId: assetType.id } })
  if (!subtype1) {
    await prisma.accountSubType.create({ data: { companyId: demoCompany.id, name: 'CURRENT_ASSET', typeId: assetType.id } })
  }
  const subtype2 = await prisma.accountSubType.findFirst({ where: { companyId: demoCompany.id, name: 'FIXED_ASSET', typeId: assetType.id } })
  if (!subtype2) {
    await prisma.accountSubType.create({ data: { companyId: demoCompany.id, name: 'FIXED_ASSET', typeId: assetType.id } })
  }

  // Payroll demo data (employee + pay schedule)
  // Use firstName+lastName for deterministic lookup in dev
  let employee = await prisma.employee.findFirst({ where: { companyId: demoCompany.id, firstName: 'Jane', lastName: 'Doe' } })
  if (!employee) {
    employee = await prisma.employee.create({ data: { companyId: demoCompany.id, firstName: 'Jane', lastName: 'Doe', ssnHash: await bcrypt.hash('123-45-6789', 10), hireDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), payRate: 35.00, payType: 'HOURLY' } })
  }

  let paySchedule = await prisma.paySchedule.findFirst({ where: { companyId: demoCompany.id, name: 'Weekly' } })
  if (!paySchedule) paySchedule = await prisma.paySchedule.create({ data: { companyId: demoCompany.id, name: 'Weekly', frequency: 'WEEKLY' } })

  console.log('Seeded demo employee and pay schedule')

  // Payroll default GL accounts (create if not present)
  await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "SAL-EXP" } }, update: {}, create: { companyId: demoCompany.id, code: "SAL-EXP", name: 'Salary Expense', typeId: expenseType.id } })
  await prisma.account.upsert({ where: { companyId_code: { companyId: demoCompany.id, code: "PAYROLL-LIAB" } }, update: {}, create: { companyId: demoCompany.id, code: "PAYROLL-LIAB", name: 'Payroll Liabilities', typeId: 4 } })

  console.log('Seeded payroll accounts')

  // Seed basic tax rates (federal/state stub for payroll testing)
  let federalTax = await prisma.taxRate.findFirst({ where: { companyId: demoCompany.id, name: 'Federal Income Tax' } })
  if (!federalTax) {
    federalTax = await prisma.taxRate.create({ data: { companyId: demoCompany.id, name: 'Federal Income Tax', rate: 0.10, effectiveFrom: new Date('2020-01-01') } })
  }
  let stateTax = await prisma.taxRate.findFirst({ where: { companyId: demoCompany.id, name: 'State Income Tax' } })
  if (!stateTax) {
    stateTax = await prisma.taxRate.create({ data: { companyId: demoCompany.id, name: 'State Income Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } })
  }
  console.log('Seeded basic tax rates')

  // Seed Time Tracking demo data (timesheet + entry + approval)
  // Create or find a demo project for timesheet entries (tolerant to schema drift)
  let project: any
  try {
    project = await prisma.project.findFirst({ where: { workspaceId: tenant.id, name: 'Demo Project' } })
  } catch (e) {
    console.warn('prisma.project.findFirst failed (schema mismatch); attempting raw lookup', errorMessage(e))
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM public."Project" WHERE "companyId" = $1 AND "name" = $2 LIMIT 1', demoCompany?.id, 'Demo Project')
    project = rows && rows.length ? rows[0] : undefined
  }

  if (!project) {
    try {
      project = await prisma.project.create({ data: { companyId: demoCompany.id, workspaceId: tenant.id, name: 'Demo Project' } })
    } catch (e) {
      console.warn('prisma.project.create failed; attempting raw INSERT fallback', errorMessage(e))
      project = await rawInsertWithTenantFallback('Project', { companyId: demoCompany?.id, name: 'Demo Project', description: 'Demo project for timesheets' }, { col: 'name', val: 'Demo Project' }) as any
    }
  }

  let demoTimesheet = await prisma.timesheet.findFirst({ where: { workspaceId: tenant.id, employeeId: employee.id } })
  if (!demoTimesheet) {
    try {
      demoTimesheet = await prisma.timesheet.create({ data: { workspaceId: tenant.id, employeeId: employee.id, weekStart: new Date(), status: 'DRAFT' } })
    } catch (e) {
      console.warn('prisma.timesheet.create failed; attempting raw INSERT fallback', errorMessage(e))
      // Try raw insert that will set tenant/workspace-like columns and required fields
      demoTimesheet = await rawInsertWithTenantFallback('Timesheet', { employeeId: employee.id, weekStart: new Date(), status: 'DRAFT' }, { col: 'employeeId', val: employee.id }) as any
      if (!demoTimesheet) {
        console.warn('Skipping timesheet seed, table or status column may not exist', e)
        demoTimesheet = await prisma.timesheet.create({ data: { workspaceId: tenant.id, employeeId: employee.id, weekStart: new Date() } }).catch(() => undefined as any)
      }
    }
  }

  // Create demo time entry (one day, 8 hours)
  if (demoTimesheet) {
    await prisma.timeEntry.createMany({ data: [ { workspaceId: demoTimesheet.workspaceId, timesheetId: demoTimesheet.id, employeeId: employee.id, projectId: project.id, date: new Date(), hours: 8.00, description: 'Demo timesheet entry' } ] }).catch(() => {})

    // Create an approval (simulate approved timesheet)
    await prisma.timesheetApproval.create({ data: { workspaceId: demoTimesheet.workspaceId, timesheetId: demoTimesheet.id, approverId: user.id, approvedAt: new Date(), comment: 'Approved for demo' } }).catch(() => {})

    console.log('Seeded demo timesheet, entry, and approval')
  } else {
    console.warn('Skipping timesheet entry and approval seeds; timesheet not created')
  }

  // Seed demo budget and lines
  // Create or find demo budget
  let demoBudget = await prisma.budget.findFirst({ where: { workspaceId: tenant.id, name: 'Demo Operating Budget' } })
  if (!demoBudget) {
    try {
      demoBudget = await prisma.budget.create({ data: { workspaceId: tenant.id, name: 'Demo Operating Budget', scenario: 'BUDGET', status: 'APPROVED', fiscalYear: new Date().getFullYear(), totalAmount: 120000.00 } })
    } catch (e) {
      console.warn('prisma.budget.create failed; attempting raw INSERT fallback', errorMessage(e))
      demoBudget = await rawInsertWithTenantFallback('Budget', { name: 'Demo Operating Budget', scenario: 'BUDGET', status: 'APPROVED', fiscalYear: new Date().getFullYear(), totalAmount: 120000.00 }, { col: 'name', val: 'Demo Operating Budget' }) as any
      if (!demoBudget) {
        console.warn('Skipping budget seed, budget table or status column may not exist', e)
        demoBudget = await prisma.budget.create({ data: { workspaceId: tenant.id, name: 'Demo Operating Budget', scenario: 'BUDGET', fiscalYear: new Date().getFullYear(), totalAmount: 120000.00 } }).catch(() => undefined as any)
      }
    }
  }

  // Create demo budget lines
  if (demoBudget) {
    await prisma.budgetLine.createMany({ data: [
      { budgetId: demoBudget.id, workspaceId: tenant.id, accountId: rev.id, month: 1, amount: 10000.00 },
      { budgetId: demoBudget.id, workspaceId: tenant.id, accountId: rev.id, month: 2, amount: 12000.00 }
    ] }).catch(() => { /* ignore duplicate insert errors during seed */ })

    console.log('Seeded demo budget and lines')
  } else {
    console.warn('Skipping demo budget lines; demoBudget not created')
  }

  // Seed fixed asset category and an example asset
  // Create or find fixed asset category
  let fac = await prisma.fixedAssetCategory.findFirst({ where: { companyId: demoCompany.id, name: 'Office Equipment' } })
  if (!fac) {
    fac = await prisma.fixedAssetCategory.create({ data: { companyId: demoCompany.id, name: 'Office Equipment' } })
  }

  // Create or find asset
  let asset = await prisma.fixedAsset.findFirst({ where: { companyId: demoCompany.id, name: 'Laptop - Demo' } })
  if (!asset) {
    asset = await prisma.fixedAsset.create({ data: { companyId: demoCompany.id, categoryId: fac.id, name: 'Laptop - Demo', acquisitionDate: new Date(), cost: 2500.00, salvageValue: 200.00, usefulLifeMonths: 36, assetAccountId: invSuspense.id } })
  }

  // Create a sample depreciation entry (first month)
  await prisma.fixedAssetDepreciation.createMany({ data: [ { companyId: demoCompany.id, assetId: asset.id, periodStart: new Date(), periodEnd: new Date(Date.now() + 30*24*60*60*1000), amount: 68.89 } ] }).catch(() => {})

  }

  console.log('Seeded fixed asset and depreciation')

  // Seed default permissions for RBAC system
  await seedPermissions()

  // Seed default roles for demo tenant
  // await seedDefaultRolesForTenant(tenant.id)  // disabled during migration
}

// Seed global permissions (tenant-agnostic)
async function seedPermissions() {
  const permissions = [
    // User management
    { key: 'users.view', desc: 'View users' },
    { key: 'users.create', desc: 'Create users' },
    { key: 'users.edit', desc: 'Edit users' },
    { key: 'users.delete', desc: 'Delete users' },
    { key: 'users.invite', desc: 'Invite users to tenant' },

    // Role management
    { key: 'roles.view', desc: 'View roles' },
    { key: 'roles.create', desc: 'Create roles' },
    { key: 'roles.edit', desc: 'Edit roles' },
    { key: 'roles.delete', desc: 'Delete roles' },

    // Company management
    { key: 'companies.view', desc: 'View companies' },
    { key: 'companies.create', desc: 'Create companies' },
    { key: 'companies.edit', desc: 'Edit companies' },
    { key: 'companies.delete', desc: 'Delete companies' },

    // Accounting - Invoices
    { key: 'invoices.view', desc: 'View invoices' },
    { key: 'invoices.create', desc: 'Create invoices' },
    { key: 'invoices.edit', desc: 'Edit invoices' },
    { key: 'invoices.delete', desc: 'Delete invoices' },
    { key: 'invoices.approve', desc: 'Approve invoices' },
    { key: 'invoices.send', desc: 'Send invoices' },

    // Accounting - Bills
    { key: 'bills.view', desc: 'View bills' },
    { key: 'bills.create', desc: 'Create bills' },
    { key: 'bills.edit', desc: 'Edit bills' },
    { key: 'bills.delete', desc: 'Delete bills' },
    { key: 'bills.approve', desc: 'Approve bills' },

    // Accounting - Payments
    { key: 'payments.view', desc: 'View payments' },
    { key: 'payments.create', desc: 'Create payments' },
    { key: 'payments.edit', desc: 'Edit payments' },
    { key: 'payments.delete', desc: 'Delete payments' },

    // Accounting - Journal Entries
    { key: 'journal.view', desc: 'View journal entries' },
    { key: 'journal.create', desc: 'Create journal entries' },
    { key: 'journal.edit', desc: 'Edit journal entries' },
    { key: 'journal.delete', desc: 'Delete journal entries' },

    // Bank accounts
    { key: 'bank.view', desc: 'View bank accounts' },
    { key: 'bank.connect', desc: 'Connect bank accounts' },
    { key: 'bank.reconcile', desc: 'Reconcile bank transactions' },

    // Reports
    { key: 'reports.view', desc: 'View reports' },
    { key: 'reports.export', desc: 'Export reports' },
    { key: 'reports.advanced', desc: 'Access advanced reports' },

    // Settings
    { key: 'settings.view', desc: 'View settings' },
    { key: 'settings.edit', desc: 'Edit settings' },
    { key: 'settings.tenant', desc: 'Manage tenant settings' },

    // Audit logs
    { key: 'audit.view', desc: 'View audit logs' },
  ];

  console.log('📝 Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { desc: perm.desc },
      create: perm,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);
}

// Helper function to create default roles for a tenant
export async function seedDefaultRolesForTenant(tenantId: string) {
  // Role seeding is temporarily disabled during the tenant->workspace migration; this stub
  // avoids complex schema assumptions in the seed runner while migrations are in progress.
  console.log(`[seed] Skipping default role seeding for ${tenantId} (migration in progress)`)
  return;
}

if (require.main === module) {
  main()
    .catch(async (e) => { console.warn('[seed] Non-critical seeding error (demo data only — tests create their own data):', errorMessage(e)); })
    .finally(async () => { await prisma.$disconnect(); })
}
