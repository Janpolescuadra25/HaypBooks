import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Test OTP bulk creation (dev-only)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
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

  it('creates multiple OTPs for different fake phones and retrieves them individually', async () => {
    const phones = ['+15550001000', '+15550001001', '+15550001002']
    const create = await request(app.getHttpServer()).post('/api/test/create-otps').send({ phones, otp: '654321', purpose: 'VERIFY_PHONE' }).expect(201)
    expect(create.body).toHaveProperty('otps')
    expect(Object.keys(create.body.otps || {}).length).toBe(3)
    expect(create.body.otps['+15550001000']).toBe('654321')

    for (const p of phones) {
      const fetch = await request(app.getHttpServer()).get('/api/test/otp/latest').query({ phone: p, purpose: 'VERIFY_PHONE' }).expect(200)
      expect(fetch.body).toHaveProperty('otpCode')
      expect(fetch.body.otpCode).toBe('654321')
    }
  })
})