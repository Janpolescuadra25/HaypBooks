import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Timesheets (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string
  let employeeId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    const tenant = await prisma.tenant.upsert({ where: { subdomain: 'timesheets-test' }, update: {}, create: { name: 'Timesheets Test Tenant', subdomain: 'timesheets-test' } })
    tenantId = tenant.id

    // create a test employee
    const employee = await prisma.employee.create({ data: { tenantId, firstName: 'TS', lastName: 'Worker', hireDate: new Date() } })
    employeeId = employee.id
  })

  afterAll(async () => {
    await prisma.timesheetApproval.deleteMany({ where: { tenantId } })
    await prisma.timeEntry.deleteMany({ where: { tenantId } })
    await prisma.timesheet.deleteMany({ where: { tenantId } })
    await prisma.employee.deleteMany({ where: { id: employeeId } })
    await prisma.tenantUser.deleteMany({ where: { tenantId } })
    await prisma.user.deleteMany({ where: { email: 'timesheets-test@example.com' } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
    await app.close()
  })

  it('creates and retrieves timesheets with entries and approvals', async () => {
    const timesheet = await prisma.timesheet.create({ data: { tenantId, employeeId, weekStart: new Date(), status: 'DRAFT' } })
    expect(timesheet).toBeDefined()

    const entry = await prisma.timeEntry.create({ data: { tenantId, timesheetId: timesheet.id, employeeId, date: new Date(), hours: 8.00, description: 'Development work' } })
    expect(entry).toBeDefined()

    const approval = await prisma.timesheetApproval.create({ data: { tenantId, timesheetId: timesheet.id, approverId: (await prisma.user.findFirst())!.id, approvedAt: new Date(), comment: 'OK' } })
    expect(approval).toBeDefined()

    const found = await prisma.timesheet.findUnique({ where: { id: timesheet.id }, include: { entries: true, approvals: true } })
    expect(found).toBeTruthy()
    expect(found!.entries.length).toBe(1)
    expect(found!.approvals.length).toBe(1)
  })
})
