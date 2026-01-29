import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

describe('Companies & Clients invite flow (e2e)', () => {
  const prisma = new PrismaClient()
  const BACKEND_DIR = path.resolve(__dirname, '..')
  const tenantSub = `invite-test-${Date.now()}`
  beforeAll(async () => {
    // Recreate test DB and run migrations + seed
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
    execSync('npm run db:seed:dev', { cwd: BACKEND_DIR, stdio: 'inherit' })
  }, 120000)

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates a tenant invite and accepts it resulting in TenantUser entry', async () => {
    // create tenant
    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    // create an owner user (raw SQL to avoid Prisma client/schema mismatch during migration)
    const ownerId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."User" ("id","email","name","passwordhash","isemailverified","createdAt","updatedAt") VALUES (${ ownerId }, ${ `${tenantSub}@example.test` }, ${ 'Owner' }, ${ 'x' }, ${ true }, now(), now()) ON CONFLICT ("email") DO NOTHING;`
    const ownerRows = await prisma.$queryRaw<any[]>`SELECT id, email FROM public."User" WHERE email = ${ `${tenantSub}@example.test` } LIMIT 1;`
    const owner = Array.isArray(ownerRows) && ownerRows.length ? ownerRows[0] : undefined

    // create an invite
    const invite = await prisma.tenantInvite.create({ data: { workspaceId: tenant.id, email: 'newuser@example.test', invitedBy: owner.id, status: 'PENDING' } })
    expect(invite).toBeDefined()

    // simulate user signup and acceptance - create the new user (raw SQL)
    const newUserId = require('crypto').randomUUID()
    await prisma.$executeRaw`INSERT INTO public."User" ("id","email","name","passwordhash","isemailverified","createdAt","updatedAt") VALUES (${ newUserId }, ${ 'newuser@example.test' }, ${ 'New User' }, ${ 'x' }, ${ true }, now(), now()) ON CONFLICT ("email") DO NOTHING;`
    const newUserRows = await prisma.$queryRaw<any[]>`SELECT id, email FROM public."User" WHERE email = ${ 'newuser@example.test' } LIMIT 1;`
    const newUser = Array.isArray(newUserRows) && newUserRows.length ? newUserRows[0] : undefined

    // accept invite by creating a TenantUser record (this is what the acceptance flow would do)
    await prisma.workspaceUser.create({ data: { workspaceId: tenant.id, userId: newUser.id, role: 'BOOKKEEPER', isOwner: false } })

    const membership = await prisma.workspaceUser.findUnique({ where: { workspaceId_userId: { workspaceId: tenant.id, userId: newUser.id } } })
    expect(membership).toBeDefined()
    expect(membership?.role).toBe('BOOKKEEPER')
  }, 20000)
})