import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Budgets (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let tenantId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    const tenant = await prisma.tenant.upsert({ where: { subdomain: 'budgets-test' }, update: {}, create: { name: 'Budgets Test Tenant', subdomain: 'budgets-test' } })
    tenantId = tenant.id
  })

  afterAll(async () => {
    await prisma.budgetLine.deleteMany({ where: { budget: { tenantId } } })
    await prisma.budget.deleteMany({ where: { tenantId } })
    await prisma.tenantUser.deleteMany({ where: { tenantId } })
    await prisma.user.deleteMany({ where: { email: 'budgets-test@example.com' } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
    await app.close()
  })

  it('creates and retrieves budgets with lines', async () => {
    const budget = await prisma.budget.create({ data: { tenantId, name: 'E2E Budget', scenario: 'BUDGET', status: 'DRAFT', fiscalYear: 2025, totalAmount: 50000 } })
    expect(budget).toBeDefined()

    const line = await prisma.budgetLine.create({ data: { budget: { connect: { id: budget.id } }, tenant: { connect: { id: tenantId } }, month: 1, amount: 4000 } })
    expect(line).toBeDefined()

    const found = await prisma.budget.findUnique({ where: { id: budget.id }, include: { lines: true } })
    expect(found).toBeTruthy()
    expect(found!.lines.length).toBe(1)
    expect(found!.lines[0].amount.toNumber()).toBe(4000)
  })
})
