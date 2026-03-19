import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class PayrollRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Employees ────────────────────────────────────────────────────────────

    async findEmployees(companyId: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.employee.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.search ? {
                    OR: [
                        { firstName: { contains: opts.search, mode: 'insensitive' } },
                        { lastName: { contains: opts.search, mode: 'insensitive' } },
                        { employeeNumber: { contains: opts.search, mode: 'insensitive' } },
                    ],
                } : {}),
            },
            select: {
                id: true, companyId: true, employeeNumber: true, firstName: true, lastName: true,
                payType: true, payRate: true, hireDate: true, terminationDate: true,
                managerId: true, createdAt: true,
            },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findEmployeeById(companyId: string, employeeId: string) {
        return this.prisma.employee.findFirst({
            where: { id: employeeId, companyId, deletedAt: null },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                taxInfo: true,
                payrollDeductions: true,
            },
        })
    }

    async createEmployee(companyId: string, data: {
        firstName: string; lastName: string; employeeNumber?: string
        payType?: string; payRate?: number; hireDate?: Date; taxId?: string; managerId?: string
    }) {
        return this.prisma.employee.create({
            data: {
                companyId, firstName: data.firstName, lastName: data.lastName,
                employeeNumber: data.employeeNumber ?? null, payType: data.payType ?? null,
                payRate: data.payRate ?? null, hireDate: data.hireDate ?? null,
                taxId: data.taxId ?? null, managerId: data.managerId ?? null,
            },
        })
    }

    async updateEmployee(companyId: string, employeeId: string, data: any) {
        return this.prisma.employee.update({ where: { id: employeeId }, data })
    }

    async terminateEmployee(companyId: string, employeeId: string, terminationDate: Date) {
        return this.prisma.employee.update({ where: { id: employeeId }, data: { terminationDate } })
    }

    // ─── Payroll Runs ─────────────────────────────────────────────────────────

    async findPayrollRuns(companyId: string, opts: { status?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.payrollRun.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: {
                _count: { select: { employees: true, paychecks: true } },
                paySchedule: { select: { id: true, name: true, frequency: true } },
            },
            orderBy: { startDate: 'desc' },
            take: opts.limit ?? 20,
            skip: opts.offset ?? 0,
        })
    }

    async findPayrollRunById(companyId: string, runId: string) {
        return this.prisma.payrollRun.findFirst({
            where: { id: runId, companyId, deletedAt: null },
            include: {
                employees: {
                    include: { employee: { select: { id: true, firstName: true, lastName: true, payType: true, payRate: true } } },
                },
                paychecks: { include: { employee: { select: { id: true, firstName: true, lastName: true } }, paycheckLines: true } },
                paySchedule: true,
            },
        })
    }

    async createPayrollRun(companyId: string, data: {
        startDate: Date; endDate: Date; payScheduleId?: string; employeeIds: string[]
    }) {
        return this.prisma.$transaction(async (tx) => {
            const run = await tx.payrollRun.create({
                data: {
                    companyId, startDate: data.startDate, endDate: data.endDate,
                    payScheduleId: data.payScheduleId ?? null, status: 'DRAFT', postingStatus: 'DRAFT',
                },
            })

            // Add all specified employees to the run
            const employees = await tx.employee.findMany({
                where: { id: { in: data.employeeIds }, companyId, deletedAt: null },
                select: { id: true, payRate: true, payType: true },
            })

            for (const emp of employees) {
                await tx.payrollRunEmployee.create({
                    data: {
                        companyId, payrollRunId: run.id, employeeId: emp.id,
                        grossAmount: 0, netAmount: 0, // computed on process step
                    },
                })
            }
            return run
        })
    }

    async processPayrollRun(companyId: string, runId: string) {
        const run = await this.prisma.payrollRun.findFirst({
            where: { id: runId, companyId },
            include: { employees: { include: { employee: { include: { payrollDeductions: true } } } } },
        })
        if (!run) return null

        return this.prisma.$transaction(async (tx) => {
            for (const re of run.employees) {
                const emp = re.employee
                // Simple gross calculation: payRate * days in period (or fixed salary)
                const periodDays = Math.ceil((new Date(run.endDate).getTime() - new Date(run.startDate).getTime()) / 86400000)
                const grossAmount = emp.payType === 'SALARY'
                    ? Number(emp.payRate ?? 0) // monthly salary raw
                    : Number(emp.payRate ?? 0) * periodDays * 8 // hourly * hours
                const deductionTotal = emp.payrollDeductions.reduce((s: number, d: any) => s + Number(d.employeeShare ?? 0), 0)
                const netAmount = Math.max(0, grossAmount - deductionTotal)

                // Update employee line
                await tx.payrollRunEmployee.update({
                    where: { id: re.id },
                    data: { grossAmount, netAmount },
                })

                // Create paycheck
                await tx.paycheck.create({
                    data: {
                        companyId, payrollRunId: runId, employeeId: emp.id,
                        date: run.endDate, grossAmount, netAmount,
                        paycheckLines: {
                            create: [
                                { companyId, lineType: 'EARNING', description: 'Regular Pay', amount: grossAmount },
                                ...(deductionTotal > 0 ? [{ companyId, lineType: 'DEDUCTION', description: 'Government Contributions', amount: deductionTotal }] : []),
                            ],
                        },
                    },
                })
            }

            return tx.payrollRun.update({ where: { id: runId }, data: { status: 'SUBMITTED', submittedAt: new Date() } })
        })
    }

    async postPayrollRun(companyId: string, runId: string) {
        return this.prisma.payrollRun.update({ where: { id: runId }, data: { status: 'POSTED', postingStatus: 'POSTED' } })
    }

    async voidPayrollRun(companyId: string, runId: string) {
        return this.prisma.payrollRun.update({ where: { id: runId }, data: { status: 'VOID', deletedAt: new Date() } })
    }

    // ─── Paychecks ────────────────────────────────────────────────────────────

    async findPaychecks(companyId: string, opts: { employeeId?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.paycheck.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.employeeId ? { employeeId: opts.employeeId } : {}),
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
                paycheckLines: true,
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findPaycheckById(companyId: string, paycheckId: string) {
        return this.prisma.paycheck.findFirst({
            where: { id: paycheckId, companyId, deletedAt: null },
            include: {
                employee: true, payrollRun: { select: { id: true, startDate: true, endDate: true } },
                paycheckLines: true, paycheckTaxes: true,
            },
        })
    }

    // ─── Employee Loans ───────────────────────────────────────────────────────

    async findLoans(companyId: string, employeeId?: string) {
        return this.prisma.employeeLoan.findMany({
            where: { companyId, ...(employeeId ? { employeeId } : {}) },
            include: { employee: { select: { firstName: true, lastName: true } }, payments: { orderBy: { paymentDate: 'desc' }, take: 3 } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createLoan(companyId: string, data: {
        employeeId: string; loanNumber: string; principalAmount: number; startDate: Date; interestRate?: number
    }) {
        return this.prisma.employeeLoan.create({
            data: {
                companyId, employeeId: data.employeeId, loanNumber: data.loanNumber,
                principalAmount: data.principalAmount, balance: data.principalAmount,
                startDate: data.startDate, interestRate: data.interestRate ?? null, status: 'ACTIVE',
            },
        })
    }

    // ─── Payroll Summary ──────────────────────────────────────────────────────

    async getPayrollSummary(companyId: string, year: number) {
        const runs = await this.prisma.payrollRun.findMany({
            where: {
                companyId, deletedAt: null, status: { in: ['SUBMITTED', 'POSTED'] as any },
                startDate: { gte: new Date(`${year}-01-01`) }, endDate: { lte: new Date(`${year}-12-31`) },
            },
            include: { _count: { select: { paychecks: true } } },
        })
        const paychecks = await this.prisma.paycheck.aggregate({
            where: { companyId, deletedAt: null, date: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } },
            _sum: { grossAmount: true, netAmount: true },
            _count: true,
        })
        return {
            year, runCount: runs.length, paycheckCount: paychecks._count,
            totalGross: Number(paychecks._sum.grossAmount ?? 0),
            totalNet: Number(paychecks._sum.netAmount ?? 0),
            totalDeductions: Number(paychecks._sum.grossAmount ?? 0) - Number(paychecks._sum.netAmount ?? 0),
        }
    }
}
