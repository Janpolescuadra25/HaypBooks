import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Tasks & Attachments API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/migrate/init-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })
    execSync('node ./scripts/migrate/run-sql.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })
    execSync('npm run db:seed:dev', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('archive/unarchive a task via API', async () => {
    const email = `e2e-task-${Date.now()}@haypbooks.test`
    const password = 'e2e-pass'
    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'E2E Task', phone: '+1 555 000 0000' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token || login.body.accessToken || login.body.accessToken

    // create tenant and task
    const tenant = await prisma.tenant.create({ data: { name: 'E2E Tenant Task', subdomain: `e2e-${Date.now()}` } })
    const user = await prisma.user.findUnique({ where: { email } })
    const task = await prisma.task.create({ data: { tenantId: tenant.id, title: 'API Archive Test', createdById: user!.id } })

    // archive
    await request(app.getHttpServer()).patch(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${token}`).send({ archived: true }).expect(200)
    const tdb = await prisma.task.findUnique({ where: { id: task.id } })
    expect(tdb!.archivedAt).toBeTruthy()

    // unarchive
    await request(app.getHttpServer()).patch(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${token}`).send({ archived: false }).expect(200)
    const tdb2 = await prisma.task.findUnique({ where: { id: task.id } })
    expect(tdb2!.archivedAt).toBeNull()

    // cleanup
    await prisma.task.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
  }, 30000)

  it('toggle attachment public flag', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'E2E Tenant Attach', subdomain: `att-${Date.now()}` } })
    const attachment = await prisma.attachment.create({ data: { tenantId: tenant.id, entityType: 'TEST', entityId: 'eid', fileUrl: 'http://x', fileName: 'f' } })

    // check default
    expect(attachment.isPublic).toBe(false)

    // toggle public
    await request(app.getHttpServer()).patch(`/api/attachments/${attachment.id}/public`).send({ isPublic: true }).expect(200)
    const a2 = await prisma.attachment.findUnique({ where: { id: attachment.id } })
    expect(a2!.isPublic).toBe(true)

    // cleanup
    await prisma.attachment.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id } })
  })
})
