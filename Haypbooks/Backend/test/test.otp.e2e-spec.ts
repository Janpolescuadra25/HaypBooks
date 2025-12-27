import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Test OTP controller (dev-only)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    // Use test DB and ensure migrations + seed are applied
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.otp.deleteMany({})
  })

  it('allows creating and retrieving OTP by phone in test mode', async () => {
    // create deterministic OTP
    const create = await request(app.getHttpServer()).post('/api/test/create-otp').send({ phone: '+15550001000', otp: '123456', purpose: 'VERIFY_PHONE' }).expect(201)
    expect(create.body).toHaveProperty('otp')

    const fetch = await request(app.getHttpServer()).get('/api/test/otp/latest').query({ phone: '+15550001000', purpose: 'VERIFY_PHONE' }).expect(200)
    expect(fetch.body).toHaveProperty('otpCode')
    expect(fetch.body.otpCode).toBe('123456')
  })
})