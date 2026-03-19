import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TaxRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Tax Codes ────────────────────────────────────────────────────────────

    async findTaxCodes(companyId: string) {
        return this.prisma.taxCode.findMany({
            where: { companyId },
            include: {
                rates: { include: { taxRate: { select: { id: true, name: true, rate: true, taxType: true } } } },
            },
            orderBy: { code: 'asc' },
        })
    }

    async createTaxCode(companyId: string, data: {
        code: string; name: string; isDefault?: boolean
        rates?: Array<{ taxRateId: string; ratePct: number; sequence?: number }>
    }) {
        if (data.isDefault) {
            await this.prisma.taxCode.updateMany({ where: { companyId, isDefault: true }, data: { isDefault: false } })
        }
        return this.prisma.taxCode.create({
            data: {
                companyId, code: data.code, name: data.name, isDefault: data.isDefault ?? false,
                ...(data.rates?.length ? {
                    rates: {
                        create: data.rates.map((r, i) => ({ taxRateId: r.taxRateId, companyId, sequence: r.sequence ?? i + 1, ratePct: r.ratePct })),
                    },
                } : {}),
            },
            include: { rates: { include: { taxRate: true } } },
        })
    }

    // ─── Tax Rates ────────────────────────────────────────────────────────────

    async findTaxRates(companyId: string) {
        return this.prisma.taxRate.findMany({
            where: { companyId, deletedAt: null },
            orderBy: [{ taxType: 'asc' }, { name: 'asc' }],
        })
    }

    async createTaxRate(companyId: string, data: {
        name: string; rate: number; taxType: string; effectiveFrom: Date; effectiveTo?: Date
        isCompound?: boolean; thresholdAmount?: number
    }) {
        return this.prisma.taxRate.create({
            data: {
                companyId, name: data.name, rate: data.rate, taxType: data.taxType,
                effectiveFrom: data.effectiveFrom, effectiveTo: data.effectiveTo ?? null,
                isCompound: data.isCompound ?? false, thresholdAmount: data.thresholdAmount ?? null,
            },
        })
    }

    // ─── VAT / Sales Tax Returns ──────────────────────────────────────────────

    async findVatReturns(companyId: string, opts: { status?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.salesTaxReturn.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            include: {
                lines: { include: { taxRate: { select: { name: true, rate: true } } } },
                filedBy: { select: { id: true, name: true } },
            },
            orderBy: { periodStart: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findVatReturnById(companyId: string, returnId: string) {
        return this.prisma.salesTaxReturn.findFirst({
            where: { id: returnId, companyId },
            include: {
                lines: { include: { taxRate: true, jurisdiction: true } },
                payments: true,
                filedBy: { select: { id: true, name: true } },
            },
        })
    }

    async createVatReturn(data: {
        workspaceId: string; companyId: string
        periodStart: Date; periodEnd: Date; dueDate?: Date
    }) {
        // Auto-compute tax from line taxes in period
        const lineTaxes = await this.prisma.lineTax.findMany({
            where: {
                invoiceLine: { invoice: { companyId: data.companyId, date: { gte: data.periodStart, lte: data.periodEnd }, deletedAt: null } },
            },
            include: { taxRate: { select: { id: true, name: true, rate: true } } },
        })
        const totalTax = lineTaxes.reduce((s, l) => s + Number(l.amount), 0)

        return this.prisma.salesTaxReturn.create({
            data: {
                workspaceId: data.workspaceId, companyId: data.companyId,
                periodStart: data.periodStart, periodEnd: data.periodEnd,
                dueDate: data.dueDate ?? null, status: 'DRAFT', totalTax,
                lines: {
                    create: Object.entries(
                        lineTaxes.reduce((acc: Record<string, number>, l) => {
                            const key = l.taxRateId ?? 'UNKNOWN'
                            acc[key] = (acc[key] ?? 0) + Number(l.amount)
                            return acc
                        }, {})
                    ).map(([taxRateId, taxAmount]) => ({ taxRateId, taxAmount, taxableAmount: undefined })),
                },
            },
            include: { lines: true },
        })
    }

    async fileVatReturn(companyId: string, returnId: string, filedById: string) {
        return this.prisma.salesTaxReturn.update({
            where: { id: returnId },
            data: { status: 'FILED', filedAt: new Date(), filedById },
        })
    }

    // ─── Withholding Tax ──────────────────────────────────────────────────────

    async findWithholdingTaxes(companyId: string) {
        return this.prisma.withholdingTaxDeduction.findMany({
            where: { companyId, isActive: true },
            include: {
                vendor: { include: { contact: { select: { displayName: true } } } },
                account: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createWithholdingTax(data: {
        companyId: string; vendorId: string; deductionType: string
        rate: number; accountId?: string; isActive?: boolean
    }) {
        return this.prisma.withholdingTaxDeduction.create({
            data: {
                companyId: data.companyId, vendorId: data.vendorId,
                deductionType: data.deductionType as any,
                rate: data.rate, accountId: data.accountId ?? null,
                isActive: data.isActive ?? true,
            },
            include: { vendor: { include: { contact: true } }, account: true },
        })
    }

    async updateWithholdingTax(id: string, data: any) {
        return this.prisma.withholdingTaxDeduction.update({ where: { id }, data })
    }

    // ─── Form 2307 (EWT Certificate) ─────────────────────────────────────────

    async findForm2307s(companyId: string, opts: { supplierId?: string; period?: string } = {}) {
        return this.prisma.form2307.findMany({
            where: {
                companyId,
                ...(opts.supplierId ? { supplierId: opts.supplierId } : {}),
                ...(opts.period ? { period: opts.period } : {}),
            },
            include: {
                supplier: { include: { contact: { select: { displayName: true } } } },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
            orderBy: { issuedAt: 'desc' },
        })
    }

    async findForm2307ById(companyId: string, formId: string) {
        return this.prisma.form2307.findFirst({
            where: { id: formId, companyId },
            include: {
                supplier: { include: { contact: { include: { contactEmails: true } } } },
                journalEntry: true,
            },
        })
    }

    async createForm2307(data: {
        companyId: string; supplierId: string; period: string; certificateNumber: string
        amount: number; withheldAmount: number; issuedAt: Date
    }) {
        return this.prisma.form2307.create({
            data: {
                companyId: data.companyId, supplierId: data.supplierId,
                period: data.period, certificateNumber: data.certificateNumber,
                amount: data.amount, withheldAmount: data.withheldAmount,
                issuedAt: data.issuedAt, status: 'ISSUED',
            },
            include: { supplier: { include: { contact: true } } },
        })
    }

    async updateForm2307Status(companyId: string, formId: string, status: string) {
        return this.prisma.form2307.update({ where: { id: formId }, data: { status } })
    }

    // ─── Alphalist ────────────────────────────────────────────────────────────

    async getAlphalist(companyId: string, taxYear: number) {
        return this.prisma.alphalistEntry.findMany({
            where: { companyId, taxYear },
            orderBy: { payeeName: 'asc' },
        })
    }

    async generateAlphalist(companyId: string, taxYear: number) {
        // Aggregate Form 2307s and payroll EWT deductions into alphalist
        const form2307s = await this.prisma.form2307.findMany({
            where: { companyId, period: { startsWith: `${taxYear}-` } },
            include: { supplier: { include: { contact: { select: { displayName: true } } } } },
        })

        // Group by supplier
        const grouped = form2307s.reduce((acc: Record<string, any>, f) => {
            const key = f.supplierId
            if (!acc[key]) {
                acc[key] = {
                    companyId, payeeType: 'VENDOR', taxYear,
                    payeeName: f.supplier.contact.displayName,
                    taxId: null, totalIncome: 0, withholdings: 0,
                }
            }
            acc[key].totalIncome += Number(f.amount)
            acc[key].withholdings += Number(f.withheldAmount)
            return acc
        }, {})

        // Upsert entries
        const entries = await Promise.all(
            Object.values(grouped).map((entry: any) =>
                this.prisma.alphalistEntry.upsert({
                    where: { companyId_taxId_taxYear: { companyId: entry.companyId, taxId: entry.taxId ?? '', taxYear } },
                    update: { totalIncome: entry.totalIncome, withholdings: entry.withholdings },
                    create: entry,
                }).catch(() =>
                    this.prisma.alphalistEntry.create({ data: entry })
                )
            )
        )
        return { taxYear, entries }
    }

    // ─── Tax Summary ──────────────────────────────────────────────────────────

    async getTaxSummary(companyId: string, from: Date, to: Date) {
        const [vatCollected, vatInput, withholding] = await Promise.all([
            // Output VAT (from invoice line taxes)
            this.prisma.lineTax.aggregate({
                where: {
                    invoiceLine: { invoice: { companyId, date: { gte: from, lte: to }, deletedAt: null } },
                    taxRate: { taxType: 'VAT' },
                },
                _sum: { amount: true },
            }),
            // Input VAT (from bill line taxes)
            this.prisma.lineTax.aggregate({
                where: {
                    billLine: { bill: { companyId, issuedAt: { gte: from, lte: to }, deletedAt: null } },
                    taxRate: { taxType: 'VAT' },
                },
                _sum: { amount: true },
            }),
            // EWT withheld (from Form 2307s)
            this.prisma.form2307.aggregate({
                where: { companyId, issuedAt: { gte: from, lte: to } },
                _sum: { withheldAmount: true },
            }),
        ])

        const outputVat = Number(vatCollected._sum.amount ?? 0)
        const inputVat = Number(vatInput._sum.amount ?? 0)
        const netVat = outputVat - inputVat

        return {
            from: from.toISOString(), to: to.toISOString(),
            outputVat, inputVat, netVat,
            totalWithholding: Number(withholding._sum.withheldAmount ?? 0),
            vatPayable: Math.max(0, netVat),
            vatRefundable: netVat < 0 ? Math.abs(netVat) : 0,
            generatedAt: new Date().toISOString(),
        }
    }
}
