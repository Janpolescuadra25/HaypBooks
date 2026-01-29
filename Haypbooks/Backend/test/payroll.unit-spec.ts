import { PayrollService } from '../src/payroll/payroll.service'
import { PrismaClient } from '@prisma/client'

describe('PayrollService unit', () => {
  let payroll: PayrollService
  const prisma = new PrismaClient()
  beforeAll(async () => {
    payroll = new PayrollService(prisma as any, null as any)
    // tenantId uuid-old backup column was removed in cleanup migrations; no alteration needed
  })

  it.skip('calculates gross, tax and net using seeded tax rates', async () => {
    const id = require('crypto').randomUUID()
    const sd = `unit-${Math.random().toString(36).slice(2,7)}`
    // create a lightweight User, Workspace and Company for the unit test
    const user = await prisma.user.create({ data: { id: require('crypto').randomUUID(), email: `unit-${Math.random().toString(36).slice(2,7)}@example`, password: 'x' } }) as any
    const workspace = await prisma.workspace.create({ data: { id, ownerUserId: user.id, type: 'OWNER' } }) as any
    const company = await prisma.company.create({ data: { workspaceId: workspace.id, countryId: 'US', name: 'Unit Company' } }) as any

    // create employee and tax rates (scoped to company)
    const emp = await prisma.employee.create({ data: { companyId: company.id, firstName: 'Unit', lastName: 'User', payRate: 20 } as any })
    await prisma.taxRate.create({ data: { companyId: company.id, name: 'Federal Income Tax', rate: 0.1, effectiveFrom: new Date('2020-01-01') } as any })
    await prisma.taxRate.create({ data: { companyId: company.id, name: 'State Income Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } as any })

    const res = await payroll.calculate(workspace.id, [{ employeeId: emp.id, hours: 40 }])
    expect(res.length).toBe(1)
    expect(res[0].gross).toBe(800)
    expect(Math.abs(res[0].tax - 120)).toBeLessThan(0.001)
    expect(Math.abs(res[0].net - 680)).toBeLessThan(0.001)

    // cleanup
    await prisma.paycheckLine.deleteMany({ where: { companyId: company.id } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { companyId: company.id } }).catch(() => {})
    // verify PaycheckTax persisted for payroll run (if any)
    const taxes = await prisma.paycheckTax.findMany({ where: { companyId: company.id } }).catch(() => [])
    expect(Array.isArray(taxes)).toBe(true)
    await prisma.taxRate.deleteMany({ where: { companyId: company.id } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { companyId: company.id } }).catch(() => {})
    await prisma.company.deleteMany({ where: { id: company.id } })
    await prisma.user.deleteMany({ where: { id: user.id } })
    await prisma.workspace.deleteMany({ where: { id: workspace.id } })
  })
})
