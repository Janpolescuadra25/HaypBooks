import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Payroll API (basic e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let workspaceId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    const tenantId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe('INSERT INTO public."Tenant" ("id","createdAt","updatedAt") VALUES ($1::uuid, now(), now())', tenantId)
    const tenant = { id: tenantId }
    tenantId = tenant.id
  })

  afterAll(async () => {
    // cleanup
    await prisma.paycheckLine.deleteMany({ where: { paycheck: { workspaceId } } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { workspaceId } }).catch(() => {})
    await prisma.payrollRunEmployee.deleteMany({ where: {} }).catch(() => {})
    await prisma.payrollRun.deleteMany({ where: { workspaceId } }).catch(() => {})
    await prisma.paySchedule.deleteMany({ where: { workspaceId } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { workspaceId } }).catch(() => {})
    await prisma.tenant.deleteMany({ where: { id: workspaceId } })
    await app.close()
  })

  it('can create an employee and pay schedule', async () => {
    const emp = await prisma.employee.create({ data: { workspaceId, firstName: 'John', lastName: 'Smith', payRate: 25.0, payType: 'HOURLY' } })
    expect(emp).toBeTruthy()
    expect(emp.firstName).toBe('John')

    const ps = await prisma.paySchedule.create({ data: { workspaceId, name: 'Biweekly', frequency: 'BIWEEKLY' } })
    expect(ps).toBeTruthy()
    expect(ps.frequency).toBe('BIWEEKLY')
  })
})
