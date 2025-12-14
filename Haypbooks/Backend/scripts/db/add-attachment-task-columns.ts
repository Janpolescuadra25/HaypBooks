import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function hasColumn(table: string, column: string) {
  const res: any[] = await prisma.$queryRaw`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=${table} AND column_name=${column}) as exists`
  return res[0]?.exists === true
}

async function run() {
  try {
    await prisma.$connect()

    // Attachment.isPublic
    const hasIsPublic = await hasColumn('Attachment', 'isPublic')
    if (!hasIsPublic) {
      console.log('Adding Attachment.isPublic column...')
      await prisma.$executeRawUnsafe('ALTER TABLE "Attachment" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;')
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Attachment_isPublic_idx" ON public."Attachment" ("isPublic");')
      console.log('Added Attachment.isPublic and index')
    } else {
      console.log('Attachment.isPublic already exists')
    }

    // Task.archivedAt
    const hasArchivedAt = await hasColumn('Task', 'archivedAt')
    if (!hasArchivedAt) {
      console.log('Adding Task.archivedAt column...')
      await prisma.$executeRawUnsafe('ALTER TABLE "Task" ADD COLUMN "archivedAt" TIMESTAMP;')
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Task_tenant_archivedAt_idx" ON public."Task" ("tenantId", "archivedAt");')
      console.log('Added Task.archivedAt and index')
    } else {
      console.log('Task.archivedAt already exists')
    }

    console.log('Done')
  } catch (e) {
    console.error('Error:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()
