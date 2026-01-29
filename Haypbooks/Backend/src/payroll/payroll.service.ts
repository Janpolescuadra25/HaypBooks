import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { JournalService } from '../accounting/journal.service'

type EmployeeHours = { employeeId: string; hours: number }

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService, private journal: JournalService) {}

  // Simple calculation: gross = hours * payRate, tax = 10% federal flat, net = gross - tax
  async calculate(tenantId: string, rows: EmployeeHours[]) {
    const workspaceId = tenantId
    const results = [] as any[]
    for (const r of rows) {
      const emp = await this.prisma.employee.findUnique({ where: { id: r.employeeId } })
      if (!emp) throw new Error('Employee not found')
      const payRate = Number(emp.payRate || 0)
      const gross = Number((payRate * r.hours).toFixed(4))
      // lookup tax rates by company (TaxRate is keyed to company)
      const companyId = emp.companyId || null
      const federal = companyId ? await this.prisma.taxRate.findFirst({ where: { companyId, jurisdictionLevel: 'FEDERAL' }, orderBy: { effectiveFrom: 'desc' } }) : null
      const state = companyId ? await this.prisma.taxRate.findFirst({ where: { companyId, jurisdictionLevel: 'STATE' }, orderBy: { effectiveFrom: 'desc' } }) : null
      const federalRate = Number(federal?.rate || 0)
      const stateRate = Number(state?.rate || 0)
      const tax = Number((gross * (federalRate + stateRate)).toFixed(4))
      const net = Number((gross - tax).toFixed(4))
      results.push({ employeeId: r.employeeId, hours: r.hours, gross, tax, net, federalRate, stateRate, companyId })
    }
    return results
  }

  // Submit payroll run: persist run, paychecks, lines and post JE
  
async submit(tenantId: string, payload: { rows: EmployeeHours[]; startDate: string; endDate: string; description?: string }) {
    const workspaceId = tenantId

    const calc = await this.calculate(tenantId, payload.rows)

    const runCompanyId = calc && calc.length ? calc[0].companyId : null
    if (!runCompanyId) throw new Error('Payroll run requires at least one employee with company')
    const payrollRun = await this.prisma.payrollRun.create({ data: { companyId: runCompanyId, startDate: new Date(payload.startDate), endDate: new Date(payload.endDate), status: 'SUBMITTED' } })

    const paychecks = [] as any[]
    let totalGross = 0
    let totalTax = 0
    let totalNet = 0

    for (const c of calc) {
      const employee = await this.prisma.employee.findUnique({ where: { id: c.employeeId } })
      const companyId = employee?.companyId || null
      const compId = c.companyId!
      const prEmp = await this.prisma.payrollRunEmployee.create({ data: { companyId: compId, payrollRunId: payrollRun.id, employeeId: c.employeeId, grossAmount: c.gross, netAmount: c.net } as any })
      const paycheck = await this.prisma.paycheck.create({ data: { companyId: compId, payrollRunId: payrollRun.id, employeeId: c.employeeId, date: new Date(), grossAmount: c.gross, netAmount: c.net } as any })
      await this.prisma.paycheckLine.create({
        data: {
          paycheck: { connect: { id: paycheck.id } },
          lineType: 'EARNING',
          description: 'Gross pay',
          amount: c.gross,
          companyId: compId
        } as any
      })
      const taxLine = await this.prisma.paycheckLine.create({
        data: {
          paycheck: { connect: { id: paycheck.id } },
          lineType: 'TAX',
          description: 'Federal withholding (10%)',
          amount: -c.tax,
          companyId: compId
        } as any
      })
      // persist explicit tax row for reporting and liability tracking
      // use rates returned from calculation
      const fr = Number(c.federalRate || 0)
      const sr = Number(c.stateRate || 0)
      if (fr > 0) await this.prisma.paycheckTax.create({ data: { paycheckId: paycheck.id, companyId: compId, jurisdiction: 'FEDERAL', rate: fr, amount: c.tax * (fr / (fr + sr || 1)) } as any })
      if (sr > 0) await this.prisma.paycheckTax.create({ data: { paycheckId: paycheck.id, companyId: compId, jurisdiction: 'STATE', rate: sr, amount: c.tax * (sr / (fr + sr || 1)) } as any })
      paychecks.push({ paycheck, prEmp })
      totalGross += c.gross
      totalTax += c.tax
      totalNet += c.net
    }

    // Post journal entry: Debit Salary Expense, Credit Payroll Tax Liability and Credit Cash (net)
    let salaryExpense = await this.prisma.account.findFirst({ where: { companyId: runCompanyId, code: 'SAL-EXP' } })
    let payrollLiability = await this.prisma.account.findFirst({ where: { companyId: runCompanyId, code: 'PAYROLL-LIAB' } })
    let cash = await this.prisma.account.findFirst({ where: { companyId: runCompanyId, code: '1000' } })

    // If missing, create basic default accounts to ensure JE posting works in demo/dev
    if (!salaryExpense) {
      salaryExpense = await this.prisma.account.create({ data: { companyId: runCompanyId, code: 'SAL-EXP', name: 'Salary Expense', typeId: 2 } as any })
    }
    if (!payrollLiability) {
      payrollLiability = await this.prisma.account.create({ data: { companyId: runCompanyId, code: 'PAYROLL-LIAB', name: 'Payroll Liabilities', typeId: 4 } as any })
    }
    if (!cash) {
      cash = await this.prisma.account.create({ data: { companyId: runCompanyId, code: '1000', name: 'Cash', typeId: 1 } as any })
    }

    const lines = [] as any[]
    lines.push({ accountId: salaryExpense?.id || '', debitAmount: totalGross, creditAmount: 0 })
    if (totalTax > 0) lines.push({ accountId: payrollLiability?.id || '', debitAmount: 0, creditAmount: totalTax })
    if (totalNet > 0) lines.push({ accountId: cash?.id || '', debitAmount: 0, creditAmount: totalNet })

    // Create journal entry scoped to company. Pass companyId explicitly.
    await this.journal.createEntry(runCompanyId, { date: new Date().toISOString(), description: payload.description || `Payroll run ${payrollRun.id}`, lines })

    await this.prisma.payrollRun.update({ where: { id: payrollRun.id }, data: { status: 'POSTED' } })

    return { payrollRun, paychecks }
  }
}
