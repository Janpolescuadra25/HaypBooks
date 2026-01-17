#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
// Lightweight slugify replacement to avoid adding new deps
function slugify(s){ if(!s) return 't'; return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50) }
const prisma = new PrismaClient()

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const limitArg = args.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 100

async function run() {
  console.log('Backfill Tenants from Users (companyName -> Tenant)')
  console.log('Options:', { apply, limit })

  const users = await prisma.user.findMany({ where: { companyName: { not: null } }, select: { id: true, email: true, companyName: true } })

  const candidates = []
  for (const u of users) {
    // skip empty or whitespace names
    const name = (u.companyName || '').trim()
    if (!name) continue
    const hasTenant = await prisma.tenantUser.findFirst({ where: { userId: u.id } })
    if (!hasTenant) candidates.push(u)
    if (candidates.length >= limit) break
  }

  console.log(`Found ${candidates.length} users with companyName and no Tenant (limit ${limit})`)

  for (const u of candidates) {
    console.log(`- User ${u.email} (${u.id}) → ${u.companyName}`)
  }

  if (!apply) {
    console.log('\nDry-run: no changes applied. Rerun with --apply to actually create Tenants (or --limit=N to limit).')
    await prisma.$disconnect()
    process.exit(0)
  }

  for (const u of candidates) {
    const base = slugify(u.companyName || 'tenant', { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
    const sub = `${base}-${Math.random().toString(36).slice(2,6)}`.slice(0, 63)
    try {
      const tenantId = require('crypto').randomUUID()
      await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
      console.log(`  Created tenant ${tenantId} (from ${u.companyName}) for user ${u.email}`)
      await prisma.tenantUser.create({ data: { tenantId: tenantId, userId: u.id, isOwner: true, role: 'owner' } })
      console.log(`  Linked user ${u.id} as owner to tenant ${tenant.id}`)
      // Create default roles for tenant
      const roleNames = ['Owner','Admin','Bookkeeper','Viewer']
      for (const rn of roleNames) {
        try { await prisma.role.create({ data: { name: rn, tenantId: tenant.id } }) } catch(e) { /* ignore uniqueness errors */ }
      }
      console.log(`  Created default roles for tenant ${tenant.id}`)
    } catch (e) {
      console.error(`  Error creating tenant for user ${u.email}:`, e && e.message ? e.message : e)
    }
  }

  await prisma.$disconnect()
  console.log('Backfill complete')
}

run().catch(e => { console.error(e); process.exit(1) })
