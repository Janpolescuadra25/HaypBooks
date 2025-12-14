"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const journal_service_1 = require("../accounting/journal.service");
let PayrollService = class PayrollService {
    constructor(prisma, journal) {
        this.prisma = prisma;
        this.journal = journal;
    }
    async calculate(tenantId, rows) {
        const results = [];
        for (const r of rows) {
            const emp = await this.prisma.employee.findUnique({ where: { id: r.employeeId } });
            if (!emp || emp.tenantId !== tenantId)
                throw new Error('Employee not found');
            const payRate = Number(emp.payRate || 0);
            const gross = Number((payRate * r.hours).toFixed(4));
            const federal = await this.prisma.taxRate.findFirst({ where: { tenantId, jurisdiction: 'FEDERAL' }, orderBy: { effectiveFrom: 'desc' } });
            const state = await this.prisma.taxRate.findFirst({ where: { tenantId, jurisdiction: 'STATE' }, orderBy: { effectiveFrom: 'desc' } });
            const federalRate = Number(federal?.rate || 0);
            const stateRate = Number(state?.rate || 0);
            const tax = Number((gross * (federalRate + stateRate)).toFixed(4));
            const net = Number((gross - tax).toFixed(4));
            results.push({ employeeId: r.employeeId, hours: r.hours, gross, tax, net, federalRate, stateRate });
        }
        return results;
    }
    async submit(tenantId, payload) {
        const calc = await this.calculate(tenantId, payload.rows);
        const payrollRun = await this.prisma.payrollRun.create({ data: { tenantId, startDate: new Date(payload.startDate), endDate: new Date(payload.endDate), status: 'SUBMITTED' } });
        const paychecks = [];
        let totalGross = 0;
        let totalTax = 0;
        let totalNet = 0;
        for (const c of calc) {
            const prEmp = await this.prisma.payrollRunEmployee.create({ data: { tenantId, payrollRunId: payrollRun.id, employeeId: c.employeeId, grossAmount: c.gross, netAmount: c.net } });
            const paycheck = await this.prisma.paycheck.create({ data: { tenantId, payrollRunId: payrollRun.id, employeeId: c.employeeId, date: new Date(), grossAmount: c.gross, netAmount: c.net } });
            await this.prisma.paycheckLine.create({
                data: {
                    paycheck: { connect: { id: paycheck.id } },
                    lineType: 'EARNING',
                    description: 'Gross pay',
                    amount: c.gross,
                    tenant: { connect: { id: tenantId } }
                }
            });
            const taxLine = await this.prisma.paycheckLine.create({
                data: {
                    paycheck: { connect: { id: paycheck.id } },
                    lineType: 'TAX',
                    description: 'Federal withholding (10%)',
                    amount: -c.tax,
                    tenant: { connect: { id: tenantId } }
                }
            });
            const fr = Number(c.federalRate || 0);
            const sr = Number(c.stateRate || 0);
            if (fr > 0)
                await this.prisma.paycheckTax.create({ data: { paycheckId: paycheck.id, tenantId, jurisdiction: 'FEDERAL', rate: fr, amount: c.tax * (fr / (fr + sr || 1)) } });
            if (sr > 0)
                await this.prisma.paycheckTax.create({ data: { paycheckId: paycheck.id, tenantId, jurisdiction: 'STATE', rate: sr, amount: c.tax * (sr / (fr + sr || 1)) } });
            paychecks.push({ paycheck, prEmp });
            totalGross += c.gross;
            totalTax += c.tax;
            totalNet += c.net;
        }
        let salaryExpense = await this.prisma.account.findFirst({ where: { tenantId, code: 'SAL-EXP' } });
        let payrollLiability = await this.prisma.account.findFirst({ where: { tenantId, code: 'PAYROLL-LIAB' } });
        let cash = await this.prisma.account.findFirst({ where: { tenantId, code: '1000' } });
        if (!salaryExpense) {
            salaryExpense = await this.prisma.account.create({ data: { tenantId, code: 'SAL-EXP', name: 'Salary Expense', typeId: 2 } });
        }
        if (!payrollLiability) {
            payrollLiability = await this.prisma.account.create({ data: { tenantId, code: 'PAYROLL-LIAB', name: 'Payroll Liabilities', typeId: 4 } });
        }
        if (!cash) {
            cash = await this.prisma.account.create({ data: { tenantId, code: '1000', name: 'Cash', typeId: 1 } });
        }
        const lines = [];
        lines.push({ accountId: salaryExpense?.id || '', debitAmount: totalGross, creditAmount: 0 });
        if (totalTax > 0)
            lines.push({ accountId: payrollLiability?.id || '', debitAmount: 0, creditAmount: totalTax });
        if (totalNet > 0)
            lines.push({ accountId: cash?.id || '', debitAmount: 0, creditAmount: totalNet });
        await this.journal.createEntry(tenantId, { date: new Date().toISOString(), description: payload.description || `Payroll run ${payrollRun.id}`, lines });
        await this.prisma.payrollRun.update({ where: { id: payrollRun.id }, data: { status: 'POSTED' } });
        return { payrollRun, paychecks };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, journal_service_1.JournalService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map