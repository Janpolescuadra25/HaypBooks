import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Payroll submit flow (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string
  let employeeId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
    // backup tenantId_uuid_old columns have been removed; no test DB alterations required

    const tenant = await prisma.tenant.create({ data: { name: 'Payroll Submit E2E', subdomain: `paysubmit-${Math.random().toString(36).slice(2,7)}` } })
    tenantId = tenant.id
    const emp = await prisma.employee.create({ data: { tenantId, firstName: 'Pay', lastName: 'Run', payRate: 20.0, payType: 'HOURLY' } })
    employeeId = emp.id
    // create basic tax rates for tenant to ensure payroll calculates taxes
    await prisma.taxRate.create({ data: { tenantId, jurisdiction: 'FEDERAL', name: 'Federal Tax', rate: 0.1, effectiveFrom: new Date('2020-01-01') } })
    await prisma.taxRate.create({ data: { tenantId, jurisdiction: 'STATE', name: 'State Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } })
  })

  afterAll(async () => {
    // clean up Journal Entries first, then payroll artifacts, then tenant
    await prisma.journalEntryLine.deleteMany({ where: { journal: { tenantId } } }).catch(() => {})
    await prisma.journalEntry.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.paycheckLine.deleteMany({ where: { paycheck: { tenantId } } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRunEmployee.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.payrollRun.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.account.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.taxRate.deleteMany({ where: { tenantId } }).catch(() => {})
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
    await app.close()
  })

  it('submits payroll and creates journal entry', async () => {
    const payload = { tenantId, startDate: new Date().toISOString(), endDate: new Date().toISOString(), rows: [{ employeeId, hours: 40 }], description: 'Pay run' }
    const res = await request(app.getHttpServer()).post('/api/payroll/submit').send(payload).expect(201)
    expect(res.body.payrollRun).toBeTruthy()
    expect(res.body.paychecks.length).toBe(1)

    // verify journal entry created
    const je = await prisma.journalEntry.findFirst({ where: { tenantId, description: { contains: 'Pay run' } } })
    expect(je).toBeTruthy()

    // verify paycheck taxes persisted
    const paychecks = res.body.paychecks
    expect(paychecks.length).toBeGreaterThan(0)
    const taxes = await prisma.paycheckTax.findMany({ where: { tenantId, paycheckId: paychecks[0].id } })
    expect(taxes.length).toBeGreaterThan(0)

    // verify journal entry lines sum to zero
    if (!je) throw new Error('JournalEntry missing')
    const lines = await prisma.journalEntryLine.findMany({ where: { journalId: je.id } })
    const total = lines.reduce((acc, l) => acc + Number(l.debit || 0) - Number(l.credit || 0), 0)
    expect(Math.abs(total)).toBeLessThan(0.001)
  })
})
