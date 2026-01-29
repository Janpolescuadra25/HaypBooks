import { PrismaService } from '../../src/repositories/prisma/prisma.service'

jest.setTimeout(30000)

describe('Project active count middleware (e2e)', () => {
  let prisma: PrismaService

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    prisma = new PrismaService()
    await prisma.$connect()
  })

  test('creating/updating/deleting projects updates Workspace.activeProjectCount', async () => {
    const timestamp = Date.now()
    const user = await prisma.user.create({ data: { email: `pa-count-${timestamp}@example.com`, password: 'x' } })
    const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id } })
    // Ensure a Country exists (some test DBs may be seeded, others may not)
    let country = await prisma.country.findFirst()
    if (!country) country = await prisma.country.create({ data: { code: 'PH', name: 'Philippines', defaultCurrency: 'PHP' } })

    const company = await prisma.company.create({ data: { workspaceId: workspace.id, countryId: country.id, name: 'PA Test Co' } })

    try {
      // Initial count
      let t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
      expect(t).toBeTruthy()
      expect((t as any).activeProjectCount).toBe(0)

      // Create a project (isActive default true)
      const p = await prisma.project.create({ data: { workspaceId: workspace.id, companyId: company.id, name: 'Test Project' } })
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