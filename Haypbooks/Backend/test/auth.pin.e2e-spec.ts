import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('PIN endpoints removed', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.session.deleteMany({})
    await prisma.otp.deleteMany({})
    await prisma.user.deleteMany({ where: { email: { contains: 'e2e' } } }).catch(() => {})
  })

  it('POST /api/auth/pin/setup should return 404', async () => {
    const email = `pin-test-${Date.now()}@haypbooks.test`
    const password = 'TestPass!23'

    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Pin Tester', phone: '+1 555 000 0000' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token

    await request(app.getHttpServer()).post('/api/auth/pin/setup').set('Authorization', `Bearer ${token}`).send({ pin: '123456', pinConfirm: '123456' }).expect(404)
  })

  it('POST /api/auth/pin/verify should return 404', async () => {
    const email = `pin-verify-${Date.now()}@haypbooks.test`
    const password = 'TestPass!23'

    await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name: 'Pin Verify', phone: '+1 555 000 0000' }).expect(201)
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email, password }).expect(200)
    const token = login.body.token

    await request(app.getHttpServer()).post('/api/auth/pin/verify').set('Authorization', `Bearer ${token}`).send({ pin: '222333' }).expect(404)
  })
})