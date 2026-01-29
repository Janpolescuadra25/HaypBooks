import { PrismaService } from '../../repositories/prisma/prisma.service'

jest.setTimeout(30000)

describe('Project active count middleware (integration)', () => {
  let prisma: PrismaService

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    prisma = new PrismaService()
    await prisma.$connect()
    // Ensure PrismaService lifecycle hooks are initialized (register middleware)
    if (typeof (prisma as any).onModuleInit === 'function') await (prisma as any).onModuleInit()
  })

  test('creating/updating/deleting projects updates Workspace.activeProjectCount', async () => {
    const timestamp = Date.now()
    const user = await prisma.user.create({ data: { email: `pa-count-${timestamp}@example.com`, password: 'x' } })
    const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id } })
    let country = await prisma.country.findFirst()
    if (!country) {
      country = await prisma.country.create({ data: { code: 'US', name: 'United States' } as any })
    }
    await prisma.$executeRawUnsafe(`INSERT INTO public."Company" ("id", "tenantId", "countryId", "name", "isActive", "createdAt", "onboardingCompleted", "onboarding_mode", "currency") VALUES (gen_random_uuid()::text, '${workspace.id}', '${country.id}', 'Test Company', true, now(), false, 'full', 'USD')`)
    const company = (await prisma.company.findFirst({ where: { workspaceId: workspace.id }, orderBy: { createdAt: 'desc' } }))!

    try {
      // Initial count
      let t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
      expect(t).toBeTruthy()
      expect((t as any).activeProjectCount).toBe(0)

      // Ensure DB has workspaceId column on Project (test DB may still have tenantId)
      const colCheck: any[] = await (prisma as any).$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='Project' AND column_name = 'workspaceId'")
      if (!colCheck || colCheck.length === 0) {
        console.warn('[TEST] Project.workspaceId column missing in DB; adding column for test')
        await prisma.$executeRawUnsafe('ALTER TABLE public."Project" ADD COLUMN IF NOT EXISTS "workspaceId" text')
        await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Project_workspaceId_idx" ON public."Project" ("workspaceId")')
      }

      // Ensure DB has isActive column
      const activeColCheck: any[] = await (prisma as any).$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='Project' AND column_name = 'isActive'")
      if (!activeColCheck || activeColCheck.length === 0) {
        console.warn('[TEST] Project.isActive column missing in DB; adding column for test')
        await prisma.$executeRawUnsafe('ALTER TABLE public."Project" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true')
      }

      // Create a project (isActive default true)
      const p = await prisma.project.create({ data: { workspaceId: workspace.id, companyId: company.id, name: 'Test Project', isActive: true } })
      t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
      expect((t as any).activeProjectCount).toBe(1)

      // Deactivate project
      await prisma.project.update({ where: { id: p.id }, data: { isActive: false } })
      t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
      expect((t as any).activeProjectCount).toBe(0)

      // Delete project
      await prisma.project.delete({ where: { id: p.id } })
      t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
      expect((t as any).activeProjectCount).toBe(0)

    } finally {
      // cleanup
      try { await prisma.project.deleteMany({ where: { workspaceId: workspace.id } }) } catch (e) {}
      try { await prisma.workspace.delete({ where: { id: workspace.id } }) } catch (e) {}
      try { await prisma.user.delete({ where: { id: user.id } }) } catch (e) {}
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})