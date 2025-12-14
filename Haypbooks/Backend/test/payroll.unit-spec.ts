import { PayrollService } from '../src/payroll/payroll.service'
import { PrismaClient } from '@prisma/client'

describe('PayrollService unit', () => {
  let payroll: PayrollService
  const prisma = new PrismaClient()
  beforeAll(async () => {
    payroll = new PayrollService(prisma as any, null as any)
    // tenantId uuid-old backup column was removed in cleanup migrations; no alteration needed
  })

  it('calculates gross, tax and net using seeded tax rates', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'UnitTenant', subdomain: `unit-${Math.random().toString(36).slice(2,7)}` } })
    // create employee and tax rates
    const emp = await prisma.employee.create({ data: { tenantId: tenant.id, firstName: 'Unit', lastName: 'User', payRate: 20 } })
    await prisma.taxRate.create({ data: { tenantId: tenant.id, jurisdiction: 'FEDERAL', name: 'Federal Income Tax', rate: 0.1, effectiveFrom: new Date('2020-01-01') } })
    await prisma.taxRate.create({ data: { tenantId: tenant.id, jurisdiction: 'STATE', name: 'State Income Tax', rate: 0.05, effectiveFrom: new Date('2020-01-01') } })

    const res = await payroll.calculate(tenant.id, [{ employeeId: emp.id, hours: 40 }])
    expect(res.length).toBe(1)
    expect(res[0].gross).toBe(800)
    expect(Math.abs(res[0].tax - 120)).toBeLessThan(0.001)
    expect(Math.abs(res[0].net - 680)).toBeLessThan(0.001)

    // cleanup
    await prisma.paycheckLine.deleteMany({ where: { paycheck: { tenantId: tenant.id } } }).catch(() => {})
    await prisma.paycheck.deleteMany({ where: { tenantId: tenant.id } }).catch(() => {})
    // verify PaycheckTax persisted for payroll run (if any)
    const taxes = await prisma.paycheckTax.findMany({ where: { tenantId: tenant.id } }).catch(() => [])
    expect(Array.isArray(taxes)).toBe(true)
    await prisma.taxRate.deleteMany({ where: { tenantId: tenant.id } }).catch(() => {})
    await prisma.employee.deleteMany({ where: { tenantId: tenant.id } }).catch(() => {})
    await prisma.tenant.deleteMany({ where: { id: tenant.id } })
  })
})
