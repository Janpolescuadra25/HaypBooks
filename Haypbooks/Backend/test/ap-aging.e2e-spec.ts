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

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()

    // figure out a valid company id from seeded data
    const comp = await prisma.company.findFirst()
    companyId = comp ? comp.id : ''
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('GET /companies/:cid/ap/reports/aging returns buckets and rows', async () => {
    const res = await request(app.getHttpServer()).get(`/api/companies/${companyId}/ap/reports/aging`).expect(200)
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