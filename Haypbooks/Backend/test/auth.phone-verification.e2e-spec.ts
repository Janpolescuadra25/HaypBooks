import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

jest.setTimeout(30000)

describe('Phone verification controller (e2e)', () => {
  let app: INestApplication
  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = mod.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('send phone code and verify (normalization)', async () => {
    // supply a phone without plus sign; normalize should store as E.164
    const phoneInput = '15550001111'
    const expectedNormalized = '+15550001111'

    // send code (dev returns OTP)
    const send = await request(app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone: phoneInput })
    expect(send.status).toBe(201)
    // In development, send should include otp in body
    const otp = send.body?.otp
    expect(typeof otp).toBe('string')

    // confirm the DB row was stored normalized
    const latest = await request(app.getHttpServer()).get(`/api/test/otp/latest?phone=${encodeURIComponent(expectedNormalized)}`).expect(200)
    expect(latest.body).toBeTruthy()
    expect(latest.body.phone).toBe(expectedNormalized)

    const verify = await request(app.getHttpServer()).post('/api/auth/phone/verify-code').send({ phone: phoneInput, code: otp })
    // controller returns 201 for POST by default
    expect(verify.status).toBe(201)
    expect(verify.body).toEqual({ success: true })
  })

  test('send phone code rejects invalid phone', async () => {
    const bad = 'abc123'
    const send = await request(app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone: bad })
    expect(send.status).toBe(400)
  })
})
