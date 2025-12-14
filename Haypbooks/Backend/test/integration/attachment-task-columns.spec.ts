import { PrismaService } from '../../src/repositories/prisma/prisma.service'

describe('Attachment.isPublic and Task.archivedAt behavior', () => {
  const prisma = new PrismaService()

  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('Attachment.isPublic defaults to false', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'AttachTest', subdomain: `attach-${Date.now()}` } })
    const attachment = await prisma.attachment.create({ data: { tenantId: tenant.id, entityType: 'TEST', entityId: 'eid', fileUrl: 'http://example', fileName: 'f.txt' } })

    expect(attachment.isPublic).toBe(false)

    await prisma.attachment.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
  })

  it('Task.archivedAt can be set and queried', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'TaskTest', subdomain: `task-${Date.now()}` } })
    const user = await prisma.user.create({ data: { email: `user-${Date.now()}@example.test`, password: 'x', isEmailVerified: true } })
    const task = await prisma.task.create({ data: { tenantId: tenant.id, title: 'To archive', createdById: user.id } })

    const date = new Date()
    await prisma.task.update({ where: { id: task.id }, data: { archivedAt: date } })

    const archived = await prisma.task.findMany({ where: { tenantId: tenant.id, archivedAt: { not: null } } })
    expect(archived.length).toBeGreaterThanOrEqual(1)

    await prisma.task.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
  })
})
