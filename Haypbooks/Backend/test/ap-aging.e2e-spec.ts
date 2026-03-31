import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('AP Aging Report e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient
  let companyId: string
  let authToken: string

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'demo@haypbooks.test', password: 'password' })
      .expect(200)

    authToken = login.body.token
    expect(authToken).toBeTruthy()

    // ensure there's a valid company/workspace and user membership for the test
    const user = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
    if (!user) throw new Error('Missing demo user seed data')

    let company = await prisma.company.findFirst()
    let workspaceId: string
    if (!company) {
      const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id, type: 'OWNER', status: 'ACTIVE', baseCurrency: 'USD' } })
      workspaceId = workspace.id
      const role = await prisma.role.create({ data: { workspaceId, name: 'Owner' } })
      await prisma.workspaceUser.create({ data: { workspaceId, userId: user.id, roleId: role.id, isOwner: true, status: 'ACTIVE' } })
      company = await prisma.company.create({ data: { workspaceId, name: 'AP Aging Company', isActive: true } })
    } else {
      workspaceId = company.workspaceId
      const role = await prisma.role.findFirst({ where: { workspaceId } })
      if (!role) {
        const newRole = await prisma.role.create({ data: { workspaceId, name: 'Owner' } })
        await prisma.workspaceUser.create({ data: { workspaceId, userId: user.id, roleId: newRole.id, isOwner: true, status: 'ACTIVE' } })
      } else {
        const exists = await prisma.workspaceUser.findFirst({ where: { workspaceId, userId: user.id } })
        if (!exists) {
          await prisma.workspaceUser.create({ data: { workspaceId, userId: user.id, roleId: role.id, isOwner: true, status: 'ACTIVE' } })
        }
      }
    }

    companyId = company.id
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('GET /companies/:cid/ap/reports/aging returns buckets and rows', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/ap/reports/aging`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(res.body).toHaveProperty('buckets')
    expect(res.body).toHaveProperty('rows')
    expect(Array.isArray(res.body.rows)).toBe(true)
    // buckets should contain numeric keys
    const buck = res.body.buckets
    expect(buck).toHaveProperty('current')
    expect(buck).toHaveProperty('days1_30')
    expect(typeof buck.current).toBe('number')
  })
})