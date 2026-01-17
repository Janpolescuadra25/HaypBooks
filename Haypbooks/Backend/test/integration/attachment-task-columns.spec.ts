import { PrismaService } from '../../src/repositories/prisma/prisma.service'

describe('Attachment.isPublic and Task.archivedAt behavior', () => {
  const prisma = new PrismaService()

  // Helper to create a tenant with fallback for legacy DBs that require id_old
  async function createTenant(data: any) {
    try {
      const id = require('crypto').randomUUID()
      await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', id)
      return { id }
    } catch (e) {
      // Fallback to raw insert including id_old and casting id to uuid
      const { randomUUID } = await import('crypto')
      const id = data.id || randomUUID()
      const idOld = data.id_old || id
      const name = data.name || null
      const subdomain = data.subdomain || null
      const baseCurrency = data.baseCurrency || 'USD'

      const rows: any[] = await prisma.$queryRawUnsafe(
        `INSERT INTO public."Tenant" ("id","name","subdomain","baseCurrency","createdAt","updatedAt","id_old") VALUES ($1::uuid,$2,$3,$4,now(),now(),$5) RETURNING *`,
        id,
        name,
        subdomain,
        baseCurrency,
        idOld,
      )

      return rows && rows[0]
    }
  }

  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('Attachment.isPublic defaults to false', async () => {
    const tenant = await createTenant({ name: 'AttachTest', subdomain: `attach-${Date.now()}` })
    // Create attachment with best-effort fallback for legacy tenantId_old constraint
    let attachment
    try {
      attachment = await prisma.attachment.create({ data: { tenantId: tenant.id, entityType: 'TEST', entityId: 'eid', fileUrl: 'http://example', fileName: 'f.txt' } })
    } catch (e) {
      // Fallback to raw insert including tenantId_old
      const rows: any[] = await prisma.$queryRawUnsafe(
        `INSERT INTO public."Attachment" ("id","tenantId","tenantId_old","entityType","entityId","fileUrl","fileName") VALUES (gen_random_uuid(),$1::uuid,$2,$3,$4,$5,$6) RETURNING *`,
        tenant.id,
        tenant.id,
        'TEST',
        'eid',
        'http://example',
        'f.txt',
      )
      attachment = rows && rows.length ? rows[0] : null
    }

    expect(attachment.isPublic).toBe(false)

    await prisma.attachment.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id }, select: { id: true } })
  })

  it('Task.archivedAt can be set and queried', async () => {
    const tenant = await createTenant({ name: 'TaskTest', subdomain: `task-${Date.now()}` })
    const user = await prisma.user.create({ data: { email: `user-${Date.now()}@example.test`, password: 'x', isEmailVerified: true } })
    let task
    try {
      task = await prisma.task.create({ data: { tenantId: tenant.id, title: 'To archive', createdById: user.id } })
    } catch (e) {
      // Fallback to raw INSERT for Task to satisfy tenantId_old legacy constraint
      const rows: any[] = await prisma.$queryRawUnsafe(
        `INSERT INTO public."Task" ("id","tenantId","tenantId_old","title","createdById","createdAt","updatedAt") VALUES (gen_random_uuid(),$1::uuid,$2,$3,$4,now(),now()) RETURNING *`,
        tenant.id,
        tenant.id,
        'To archive',
        user.id,
      )
      task = rows && rows.length ? rows[0] : null
    }

    const date = new Date()
    await prisma.task.update({ where: { id: task.id }, data: { archivedAt: date } })

    const archived = await prisma.task.findMany({ where: { tenantId: tenant.id, archivedAt: { not: null } } })
    expect(archived.length).toBeGreaterThanOrEqual(1)

    await prisma.task.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.tenant.delete({ where: { id: tenant.id }, select: { id: true } })
  })
})
