import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PayrollRepository } from './payroll.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class PayrollService {
    constructor(private readonly repo: PayrollRepository, private readonly prisma: PrismaService) { }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    // ─── Employees ────────────────────────────────────────────────────────────

    async listEmployees(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findEmployees(companyId, {
            search: opts.search,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getEmployee(userId: string, companyId: string, employeeId: string) {
        await this.assertAccess(userId, companyId)
        const e = await this.repo.findEmployeeById(companyId, employeeId)
        if (!e) throw new NotFoundException('Employee not found')
        return e
    }

    async createEmployee(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.firstName) throw new BadRequestException('firstName is required')
        if (!data.lastName) throw new BadRequestException('lastName is required')
        return this.repo.createEmployee(companyId, {
            ...data,
            payRate: data.payRate ? Number(data.payRate) : undefined,
            hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        })
    }

    async updateEmployee(userId: string, companyId: string, employeeId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const e = await this.repo.findEmployeeById(companyId, employeeId)
        if (!e) throw new NotFoundException('Employee not found')
        return this.repo.updateEmployee(companyId, employeeId, data)
    }

    async terminateEmployee(userId: string, companyId: string, employeeId: string, data: { terminationDate: string }) {
        await this.assertAccess(userId, companyId)
        if (!data.terminationDate) throw new BadRequestException('terminationDate is required')
        const e = await this.repo.findEmployeeById(companyId, employeeId)
        if (!e) throw new NotFoundException('Employee not found')
        return this.repo.terminateEmployee(companyId, employeeId, new Date(data.terminationDate))
    }

    // ─── Payroll Runs ─────────────────────────────────────────────────────────

    async listPayrollRuns(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findPayrollRuns(companyId, {
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 20,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getPayrollRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = await this.repo.findPayrollRunById(companyId, runId)
        if (!run) throw new NotFoundException('Payroll run not found')
        return run
    }

    async createPayrollRun(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.startDate) throw new BadRequestException('startDate is required')
        if (!data.endDate) throw new BadRequestException('endDate is required')
        if (!data.employeeIds?.length) throw new BadRequestException('At least one employee is required')
        return this.repo.createPayrollRun(companyId, {
            startDate: new Date(data.startDate), endDate: new Date(data.endDate),
            payScheduleId: data.payScheduleId, employeeIds: data.employeeIds,
        })
    }

    async processPayrollRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = await this.repo.findPayrollRunById(companyId, runId)
        if (!run) throw new NotFoundException('Payroll run not found')
        if (run.status !== 'DRAFT') throw new BadRequestException('Only DRAFT payroll runs can be processed')
        const result = await this.repo.processPayrollRun(companyId, runId)
        if (!result) throw new BadRequestException('Processing failed')
        return result
    }

    async postPayrollRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = await this.repo.findPayrollRunById(companyId, runId)
        if (!run) throw new NotFoundException('Payroll run not found')
        if (run.status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED payroll runs can be posted')
        return this.repo.postPayrollRun(companyId, runId)
    }

    async voidPayrollRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = await this.repo.findPayrollRunById(companyId, runId)
        if (!run) throw new NotFoundException('Payroll run not found')
        if (run.status === 'VOID') throw new BadRequestException('Payroll run is already void')
        return this.repo.voidPayrollRun(companyId, runId)
    }

    // ─── Paychecks ────────────────────────────────────────────────────────────

    async listPaychecks(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findPaychecks(companyId, {
            employeeId: opts.employeeId,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getPaycheck(userId: string, companyId: string, paycheckId: string) {
        await this.assertAccess(userId, companyId)
        const p = await this.repo.findPaycheckById(companyId, paycheckId)
        if (!p) throw new NotFoundException('Paycheck not found')
        return p
    }

    // ─── Loans ────────────────────────────────────────────────────────────────

    async listLoans(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findLoans(companyId, opts.employeeId)
    }

    async createLoan(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.employeeId) throw new BadRequestException('employeeId is required')
        if (!data.principalAmount) throw new BadRequestException('principalAmount is required')
        if (!data.startDate) throw new BadRequestException('startDate is required')
        const loanNumber = data.loanNumber ?? `LOAN-${Date.now()}`
        return this.repo.createLoan(companyId, {
            ...data, loanNumber, principalAmount: Number(data.principalAmount),
            startDate: new Date(data.startDate),
        })
    }

    // ─── Payroll Summary ──────────────────────────────────────────────────────

    async getPayrollSummary(userId: string, companyId: string, year: number) {
        await this.assertAccess(userId, companyId)
        return this.repo.getPayrollSummary(companyId, year || new Date().getFullYear())
    }

    // ─── Salary Structures ────────────────────────────────────────────────────

    async listSalaryStructures(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.salaryStructure.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createSalaryStructure(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.salaryStructure.create({
            data: {
                companyId,
                name: data.name,
                description: data.description,
                isDefault: data.isDefault ?? false,
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateSalaryStructure(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.salaryStructure.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Salary structure not found')
        return this.prisma.salaryStructure.update({ where: { id }, data })
    }

    // ─── Benefit Plans ────────────────────────────────────────────────────────

    async listBenefitPlans(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.benefitPlan.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createBenefitPlan(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.planType) throw new BadRequestException('planType is required')
        return this.prisma.benefitPlan.create({
            data: {
                companyId,
                name: data.name,
                planType: data.planType,
                provider: data.provider,
                description: data.description,
                employeeContributionAmt: data.employeeContributionAmt ? Number(data.employeeContributionAmt) : undefined,
                employerContributionAmt: data.employerContributionAmt ? Number(data.employerContributionAmt) : undefined,
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateBenefitPlan(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.benefitPlan.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Benefit plan not found')
        return this.prisma.benefitPlan.update({ where: { id }, data })
    }

    // ─── Deductions ───────────────────────────────────────────────────────────

    async listDeductions(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.payrollDeduction.findMany({
            where: { companyId, ...(opts.employeeId ? { employeeId: opts.employeeId } : {}) },
            include: { employee: true },
            orderBy: { period: 'desc' },
        })
    }

    async createDeduction(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.employeeId) throw new BadRequestException('employeeId is required')
        if (!data.deductionType) throw new BadRequestException('deductionType is required')
        if (!data.period) throw new BadRequestException('period is required')
        return this.prisma.payrollDeduction.create({
            data: {
                companyId,
                employeeId: data.employeeId,
                deductionType: data.deductionType,
                employeeShare: Number(data.employeeShare ?? 0),
                employerShare: data.employerShare ? Number(data.employerShare) : undefined,
                period: data.period,
            },
        })
    }

    // ─── Leave Requests ───────────────────────────────────────────────────────

    async listLeaveRequests(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.timeOffRequest.findMany({
            where: {
                companyId,
                ...(opts.employeeId ? { employeeId: opts.employeeId } : {}),
                ...(opts.status ? { status: opts.status } : {}),
            },
            include: { employee: true },
            orderBy: { startDate: 'desc' },
        })
    }

    async createLeaveRequest(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.employeeId) throw new BadRequestException('employeeId is required')
        if (!data.timeOffType) throw new BadRequestException('timeOffType is required')
        if (!data.startDate) throw new BadRequestException('startDate is required')
        if (!data.endDate) throw new BadRequestException('endDate is required')
        return this.prisma.timeOffRequest.create({
            data: {
                companyId,
                employeeId: data.employeeId,
                timeOffType: data.timeOffType,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                hours: data.hours ? Number(data.hours) : undefined,
                status: data.status ?? 'PENDING',
            },
        })
    }

    async approveLeaveRequest(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const req = await this.prisma.timeOffRequest.findFirst({ where: { id, companyId } })
        if (!req) throw new NotFoundException('Leave request not found')
        return this.prisma.timeOffRequest.update({
            where: { id },
            data: { status: 'APPROVED', approverId: userId, approvedAt: new Date() },
        })
    }

    async rejectLeaveRequest(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const req = await this.prisma.timeOffRequest.findFirst({ where: { id, companyId } })
        if (!req) throw new NotFoundException('Leave request not found')
        return this.prisma.timeOffRequest.update({ where: { id }, data: { status: 'REJECTED' } })
    }

    // ─── Leave Balances ───────────────────────────────────────────────────────

    async listLeaveBalances(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.timeOffBalance.findMany({
            where: { companyId, ...(opts.employeeId ? { employeeId: opts.employeeId } : {}) },
            include: { employee: true },
        })
    }

    // ─── Government Contributions ─────────────────────────────────────────────

    async listGovernmentContributions(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.governmentRemittance.findMany({
            where: {
                companyId,
                ...(opts.remittanceType ? { remittanceType: opts.remittanceType } : {}),
                ...(opts.period ? { period: opts.period } : {}),
            },
            orderBy: { dueDate: 'desc' },
        })
    }

    async createGovernmentContribution(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.remittanceType) throw new BadRequestException('remittanceType is required')
        if (!data.period) throw new BadRequestException('period is required')
        if (!data.dueDate) throw new BadRequestException('dueDate is required')
        if (!data.totalAmount) throw new BadRequestException('totalAmount is required')
        return this.prisma.governmentRemittance.create({
            data: {
                companyId,
                remittanceType: data.remittanceType,
                period: data.period,
                dueDate: new Date(data.dueDate),
                totalAmount: Number(data.totalAmount),
                employeeShare: data.employeeShare ? Number(data.employeeShare) : undefined,
                employerShare: data.employerShare ? Number(data.employerShare) : undefined,
                referenceNo: data.referenceNo,
                status: data.status ?? 'PENDING',
            },
        })
    }

    // ─── Shift Schedules ──────────────────────────────────────────────────────

    async listShiftSchedules(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.shiftSchedule.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        })
    }

    async createShiftSchedule(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.shiftSchedule.create({
            data: {
                companyId,
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                breakMins: data.breakMins ? Number(data.breakMins) : undefined,
                workDays: data.workDays,
            },
        })
    }

    // ─── Allowances (SalaryStructureComponent EARNING) ────────────────────────

    private async getOrCreateDefaultStructure(companyId: string) {
        let s = await this.prisma.salaryStructure.findFirst({ where: { companyId, isDefault: true } })
        if (!s) s = await this.prisma.salaryStructure.findFirst({ where: { companyId } })
        if (!s) {
            s = await this.prisma.salaryStructure.create({
                data: { companyId, name: 'Default', isDefault: true },
            })
        }
        return s
    }

    async listAllowances(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const structures = await this.prisma.salaryStructure.findMany({ where: { companyId }, select: { id: true, name: true } })
        if (!structures.length) return []
        const structureIds = structures.map(s => s.id)
        const comps = await this.prisma.salaryStructureComponent.findMany({
            where: { structureId: { in: structureIds }, componentType: 'EARNING' },
            include: { structure: { select: { id: true, name: true } } },
            orderBy: { sortOrder: 'asc' },
        })
        return comps
    }

    async createAllowance(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        const structure = await this.getOrCreateDefaultStructure(companyId)
        return this.prisma.salaryStructureComponent.create({
            data: {
                structureId: structure.id,
                name: data.name,
                componentType: 'EARNING',
                calculationType: data.calculationType ?? 'fixed',
                value: data.value != null ? Number(data.value) : undefined,
                isTaxable: data.isTaxable ?? true,
            },
            include: { structure: { select: { id: true, name: true } } },
        })
    }

    async updateAllowance(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.salaryStructureComponent.findFirst({
            where: { id },
            include: { structure: { select: { companyId: true } } },
        })
        if (!existing || existing.structure.companyId !== companyId) throw new NotFoundException('Allowance not found')
        return this.prisma.salaryStructureComponent.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.calculationType && { calculationType: data.calculationType }),
                ...(data.value != null && { value: Number(data.value) }),
                ...(data.isTaxable != null && { isTaxable: data.isTaxable }),
            },
            include: { structure: { select: { id: true, name: true } } },
        })
    }

    async deleteAllowance(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.salaryStructureComponent.findFirst({
            where: { id },
            include: { structure: { select: { companyId: true } } },
        })
        if (!existing || existing.structure.companyId !== companyId) throw new NotFoundException('Allowance not found')
        await this.prisma.salaryStructureComponent.delete({ where: { id } })
        return { success: true }
    }
}
