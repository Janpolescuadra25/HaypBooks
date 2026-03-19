import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')

// migrations and DB setup can take a while in CI – bump jest timeout
jest.setTimeout(120000)

describe('Payroll run submission e2e', () => {
  let app: INestApplication
  let prisma: PrismaClient
  let companyId: string
  let employeeId: string
  let payScheduleId: string
  let runId: string

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()

    const comp = await prisma.company.findFirst()
    companyId = comp ? comp.id : ''

    // pick seeded employee and pay schedule from seed script
    const emp = await prisma.employee.findFirst({ where: { companyId } })
    employeeId = emp ? emp.id : ''
    const ps  = await prisma.paySchedule.findFirst({ where: { companyId } })
    payScheduleId = ps ? ps.id : ''
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('can create, process, post and void a payroll run', async () => {
    // create run
    const start = new Date().toISOString().slice(0, 10)
    const end = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const createRes = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/payroll/runs`)
      .send({ startDate: start, endDate: end, payScheduleId, employeeIds: [employeeId] })
      .expect(201)
    expect(createRes.body).toHaveProperty('id')
    runId = createRes.body.id

    // list runs and ensure draft
    const listRes = await request(app.getHttpServer()).get(`/api/companies/${companyId}/payroll/runs`).expect(200)
    expect(Array.isArray(listRes.body)).toBe(true)
    const draft = listRes.body.find((r: any) => r.id === runId)
    expect(draft).toBeDefined()
    expect(draft.status).toBe('DRAFT')

    // process run -> status should become SUBMITTED
    await request(app.getHttpServer()).post(`/api/companies/${companyId}/payroll/runs/${runId}/process`).expect(200)
    const afterProcess = await request(app.getHttpServer()).get(`/api/companies/${companyId}/payroll/runs/${runId}`).expect(200)
    expect(afterProcess.body.status).toBe('SUBMITTED')

    // paychecks should exist
    const payRes = await request(app.getHttpServer()).get(`/api/companies/${companyId}/payroll/paychecks`).expect(200)
    expect(Array.isArray(payRes.body)).toBe(true)
    expect(payRes.body.length).toBeGreaterThan(0)
    expect(payRes.body[0]).toHaveProperty('employee')

    // post run
    await request(app.getHttpServer()).post(`/api/companies/${companyId}/payroll/runs/${runId}/post`).expect(200)
    const afterPost = await request(app.getHttpServer()).get(`/api/companies/${companyId}/payroll/runs/${runId}`).expect(200)
    expect(afterPost.body.status).toBe('POSTED')

    // void run (should still succeed but mark voided)
    await request(app.getHttpServer()).post(`/api/companies/${companyId}/payroll/runs/${runId}/void`).expect(200)
    const afterVoid = await request(app.getHttpServer()).get(`/api/companies/${companyId}/payroll/runs/${runId}`).expect(200)
    expect(afterVoid.body.status).toBe('VOID')
  })
})
