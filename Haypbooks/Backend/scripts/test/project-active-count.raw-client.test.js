const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()

  // Register the same Project-focused middleware logic directly on PrismaClient
  prisma.$use(async (params, next) => {
    if (params.model !== 'Project') return next(params)
    const action = params.action
    if (!['create', 'update', 'delete'].includes(action)) return next(params)

    let prev = null
    if (action === 'update' || action === 'delete') {
      try { prev = await prisma.project.findUnique({ where: params.args.where }) } catch (e) { prev = null }
    }

    const result = await next(params)

    const tenantId = prev?.tenantId || prev?.workspaceId || result?.tenantId || result?.workspaceId || params.args.data?.tenantId || params.args.data?.workspaceId || null
    if (!tenantId) return result

    const prevActive = prev ? prev.isActive === true : false
    const nextActive = result?.isActive === true || params.args.data?.isActive === true

    let delta = 0
    if (action === 'create' && nextActive) delta = 1
    if (action === 'delete' && prevActive) delta = -1
    if (action === 'update') {
      if (!prevActive && nextActive) delta = 1
      if (prevActive && !nextActive) delta = -1
    }

    if (delta !== 0) {
      try {
        await prisma.workspace.update({ where: { id: workspaceId }, data: { activeProjectCount: { increment: delta } } })
      } catch (e) { /* best-effort */ }
    }

    return result
  })

  try {
    // Create user/workspace/company
    const user = await prisma.user.create({ data: { email: `raw-pa-${Date.now()}@example.com`, password: 'x' } })
    let workspace = await prisma.workspace.findFirst()
    if (!workspace) {
      console.log('No existing workspace found; creating via raw SQL insert into Tenant table')
      const tenantId = (await prisma.$queryRawUnsafe('SELECT gen_random_uuid() as id')).map?.(r => r.id)?.[0] || null
      const id = tenantId || require('crypto').randomUUID()
      // Minimal Tenant insert - some columns may be nullable; use a safe set
      await prisma.$executeRawUnsafe(`INSERT INTO "Tenant" ("id","ownerUserId","name","createdAt") VALUES ('${id}', '${user.id}', 'RAW Tenant', now())`)
      workspace = await prisma.workspace.findUnique({ where: { id } })
    }
    let country = await prisma.country.findFirst()
    if (!country) country = await prisma.country.create({ data: { code: 'PH', name: 'Philippines', defaultCurrency: 'PHP' } })
    const company = await prisma.company.create({ data: { workspaceId: workspace.id, countryId: country.id, name: 'PA Raw Test Co' } })

    console.log('Initial workspace count:', (await prisma.workspace.findUnique({ where: { id: workspace.id } })).activeProjectCount)

    const p = await prisma.project.create({ data: { workspaceId: workspace.id, companyId: company.id, name: 'Raw Test Project' } })
    console.log('After create workspace count:', (await prisma.workspace.findUnique({ where: { id: workspace.id } })).activeProjectCount)

    await prisma.project.update({ where: { id: p.id }, data: { isActive: false } })
    console.log('After deactivate workspace count:', (await prisma.workspace.findUnique({ where: { id: workspace.id } })).activeProjectCount)

    await prisma.project.delete({ where: { id: p.id } })
    console.log('After delete workspace count:', (await prisma.workspace.findUnique({ where: { id: workspace.id } })).activeProjectCount)

    // cleanup
    await prisma.project.deleteMany({ where: { workspaceId: workspace.id } }).catch(() => {})
    await prisma.company.delete({ where: { id: company.id } }).catch(() => {})
    await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => {})
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {})

    console.log('Raw client test completed')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()