import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

export async function runIntegrityChecks(prisma: any) {
  const issues: Array<{ check: string; rows: any[] }> = []

  // 1) Users with companyName but no TenantUser entries (i.e., not linked to a tenant)
  const usersMissingTenant = await prisma.user.findMany({
    where: {
      AND: [
        { companyName: { not: null } },
        { companyName: { not: '' } },
        { TenantUser: { none: {} } },
      ],
    },
    select: { id: true, email: true, companyName: true },
    take: 50,
  })
  if (usersMissingTenant.length) issues.push({ check: 'users_missing_tenant', rows: usersMissingTenant })

  // 2) Tenants with no owner (no TenantUser with isOwner = true)
  const tenantsWithoutOwners = await prisma.$queryRawUnsafe(`
    SELECT t.id, t.name FROM "Tenant" t
    LEFT JOIN "TenantUser" tu ON t.id = tu."tenantId" AND tu."isOwner" = true
    WHERE tu."userId" IS NULL
    LIMIT 50
  `)
  if ((tenantsWithoutOwners as any[]).length) issues.push({ check: 'tenants_without_owner', rows: tenantsWithoutOwners as any[] })

  // 3) Orphaned TenantUser rows (tenant no longer exists)
  const orphanedTenantUsers = await prisma.$queryRawUnsafe(`
    SELECT tu."tenantId", tu."userId" FROM "TenantUser" tu
    LEFT JOIN "Tenant" t ON tu."tenantId" = t.id
    WHERE t.id IS NULL
    LIMIT 50
  `)
  if ((orphanedTenantUsers as any[]).length) issues.push({ check: 'orphaned_tenant_users', rows: orphanedTenantUsers as any[] })

  // 4) Duplicate tenant subdomains
  const dupSubdomains = await prisma.$queryRawUnsafe(`
    SELECT subdomain, count(*) as c FROM "Tenant"
    WHERE COALESCE(subdomain,'') <> ''
    GROUP BY subdomain HAVING count(*) > 1
  `)
  if ((dupSubdomains as any[]).length) issues.push({ check: 'duplicate_tenant_subdomains', rows: dupSubdomains as any[] })

  // 5) TenantUser rows with user missing
  const orphanedTenantUsersNoUser = await prisma.$queryRawUnsafe(`
    SELECT tu."tenantId", tu."userId" FROM "TenantUser" tu
    LEFT JOIN "User" u ON u.id = tu."userId"
    WHERE u.id IS NULL
    LIMIT 50
  `)
  if ((orphanedTenantUsersNoUser as any[]).length) issues.push({ check: 'orphaned_tenant_users_no_user', rows: orphanedTenantUsersNoUser as any[] })

  return issues
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const issues = await runIntegrityChecks(prisma)
    if (issues.length === 0) {
      console.log('No integrity issues found')
      process.exit(0)
    }

    console.error('DB INTEGRITY ISSUES FOUND:')
    for (const it of issues) {
      console.error(`- ${it.check}: ${it.rows.length} example(s)`)
      console.error(JSON.stringify(it.rows, null, 2))
    }

    const strict = (process.env.STRICT_DB_INTEGRITY || '').toLowerCase() === 'true'
    if (strict) {
      console.error('STRICT_DB_INTEGRITY is true: failing CI due to integrity issues')
      process.exit(2)
    } else {
      console.warn('Integrity issues found; run backfill/fixes before merging')
      process.exit(0)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Allow importing runIntegrityChecks in tests without executing main
if (require.main === module) {
  main()
}
