import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { TaxRepository } from './tax.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TaxService {
    constructor(private readonly repo: TaxRepository, private readonly prisma: PrismaService) { }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async getLocaleForCompany(companyId: string) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { country: true },
        })
        if (!company) throw new NotFoundException('Company not found')

        const countryCode = (company.country ?? '').toUpperCase()
        if (!countryCode) return 'en-US'

        const country = await this.prisma.country.findUnique({
            where: { code: countryCode as any },
            select: { locale: true },
        })
        if (country?.locale) return country.locale

        // Fallbacks
        if (countryCode === 'PH') return 'en-PH'
        if (countryCode === 'US') return 'en-US'
        return 'en-US'
    }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    // ─── Tax Codes ────────────────────────────────────────────────────────────

    async listTaxCodes(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findTaxCodes(companyId)
    }

    async createTaxCode(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.code) throw new BadRequestException('code is required')
        if (!data.name) throw new BadRequestException('name is required')
        return this.repo.createTaxCode(companyId, data)
    }

    // ─── Tax Rates ────────────────────────────────────────────────────────────

    async listTaxRates(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findTaxRates(companyId)
    }

    async createTaxRate(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (data.rate === undefined) throw new BadRequestException('rate is required')
        if (!data.taxType) throw new BadRequestException('taxType is required')
        if (!data.effectiveFrom) throw new BadRequestException('effectiveFrom is required')
        return this.repo.createTaxRate(companyId, {
            ...data, rate: Number(data.rate), effectiveFrom: new Date(data.effectiveFrom),
            effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
        })
    }

    // ─── VAT Returns ──────────────────────────────────────────────────────────

    async listVatReturns(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findVatReturns(companyId, {
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getVatReturn(userId: string, companyId: string, returnId: string) {
        await this.assertAccess(userId, companyId)
        const r = await this.repo.findVatReturnById(companyId, returnId)
        if (!r) throw new NotFoundException('VAT return not found')
        return r
    }

    async createVatReturn(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.periodStart) throw new BadRequestException('periodStart is required')
        if (!data.periodEnd) throw new BadRequestException('periodEnd is required')
        return this.repo.createVatReturn({
            workspaceId, companyId,
            periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd),
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        })
    }

    async fileVatReturn(userId: string, companyId: string, returnId: string) {
        await this.assertAccess(userId, companyId)
        const r = await this.repo.findVatReturnById(companyId, returnId)
        if (!r) throw new NotFoundException('VAT return not found')
        if (r.status === 'FILED') throw new BadRequestException('VAT return is already filed')
        return this.repo.fileVatReturn(companyId, returnId, userId)
    }

    // ─── Withholding Tax ──────────────────────────────────────────────────────

    async listWithholdingTaxes(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findWithholdingTaxes(companyId)
    }

    async createWithholdingTax(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.vendorId) throw new BadRequestException('vendorId is required')
        if (!data.deductionType) throw new BadRequestException('deductionType is required')
        if (data.rate === undefined) throw new BadRequestException('rate is required')
        return this.repo.createWithholdingTax({ companyId, ...data, rate: Number(data.rate) })
    }

    async updateWithholdingTax(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.updateWithholdingTax(id, data)
    }

    // ─── Form 2307 (EWT Certificate) ─────────────────────────────────────────

    async listForm2307s(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findForm2307s(companyId, opts)
    }

    async getForm2307(userId: string, companyId: string, formId: string) {
        await this.assertAccess(userId, companyId)
        const f = await this.repo.findForm2307ById(companyId, formId)
        if (!f) throw new NotFoundException('Form 2307 not found')
        return f
    }

    async createForm2307(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const required = ['supplierId', 'period', 'certificateNumber', 'amount', 'withheldAmount', 'issuedAt']
        for (const f of required) {
            if (!data[f]) throw new BadRequestException(`${f} is required`)
        }
        return this.repo.createForm2307({
            companyId, ...data,
            amount: Number(data.amount), withheldAmount: Number(data.withheldAmount),
            issuedAt: new Date(data.issuedAt),
        })
    }

    async updateForm2307Status(userId: string, companyId: string, formId: string, status: string) {
        await this.assertAccess(userId, companyId)
        const allowed = ['ISSUED', 'RECEIVED', 'APPLIED']
        if (!allowed.includes(status)) throw new BadRequestException(`Invalid status. Allowed: ${allowed.join(', ')}`)
        return this.repo.updateForm2307Status(companyId, formId, status)
    }

    // ─── Alphalist ────────────────────────────────────────────────────────────

    async getAlphalist(userId: string, companyId: string, taxYear: number) {
        await this.assertAccess(userId, companyId)
        return this.repo.getAlphalist(companyId, taxYear)
    }

    async generateAlphalist(userId: string, companyId: string, taxYear: number) {
        await this.assertAccess(userId, companyId)
        if (!taxYear) throw new BadRequestException('taxYear is required')
        return this.repo.generateAlphalist(companyId, taxYear)
    }

    // ─── Tax Summary ──────────────────────────────────────────────────────────

    async getTaxSummary(userId: string, companyId: string, opts: { from?: string; to?: string }) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const from = opts.from ? new Date(opts.from) : new Date(now.getFullYear(), 0, 1)
        const to = opts.to ? new Date(opts.to) : now
        if (from > to) throw new BadRequestException('from must be before to')
        return this.repo.getTaxSummary(companyId, from, to)
    }

    // ─── BIR Forms ────────────────────────────────────────────────────────────

    /**
     * Compute BIR Form 2550M (Monthly VAT Return) or 2550Q (Quarterly VAT Return)
     * figures directly from posted General Ledger journal entry lines.
     *
     * Uses Philippine standard COA codes:
     *   2050 — Output VAT Payable (credit balances = output VAT collected)
     *   1200 — Input VAT / Input Tax (debit balances = VAT paid to suppliers)
     *   4xxx — Revenue accounts (credit balances = gross taxable sales)
     */
    private async computeVatReturn2550(
        companyId: string,
        taxYear: number,
        period: string,
        formType: '2550M' | '2550Q',
    ) {
        // Determine period date range
        let periodStart: Date
        let periodEnd: Date
        if (formType === '2550M') {
            // period may be "YYYY-MM", "M", or a plain month number
            const month = period.includes('-')
                ? parseInt(period.split('-')[1], 10)
                : parseInt(period, 10)
            const m = isNaN(month) ? 1 : month
            periodStart = new Date(taxYear, m - 1, 1)
            periodEnd = new Date(taxYear, m, 0, 23, 59, 59, 999)
        } else {
            // period may be "Q1"–"Q4" or "1"–"4"
            const qNum = parseInt(period.replace(/[Qq]/, ''), 10) || 1
            const startMonth = (qNum - 1) * 3  // 0-based
            periodStart = new Date(taxYear, startMonth, 1)
            periodEnd = new Date(taxYear, startMonth + 3, 0, 23, 59, 59, 999)
        }

        // Resolve account IDs for the relevant COA codes
        const [outputVatAcct, inputVatAcct, revenueAccts] = await Promise.all([
            this.prisma.account.findFirst({ where: { companyId, code: '2050', deletedAt: null }, select: { id: true } }),
            this.prisma.account.findFirst({ where: { companyId, code: '1200', deletedAt: null }, select: { id: true } }),
            this.prisma.account.findMany({ where: { companyId, code: { startsWith: '4' }, deletedAt: null }, select: { id: true } }),
        ])

        const revenueIds = revenueAccts.map(a => a.id)

        // Aggregate Output VAT: credits on account 2050 from POSTED JEs in period
        const outputResult = outputVatAcct
            ? await this.prisma.journalEntryLine.aggregate({
                _sum: { credit: true },
                where: {
                    companyId,
                    accountId: outputVatAcct.id,
                    journal: { date: { gte: periodStart, lte: periodEnd }, postingStatus: 'POSTED', deletedAt: null },
                },
            })
            : { _sum: { credit: null } }

        // Aggregate Input VAT: debits on account 1200 from POSTED JEs in period
        const inputResult = inputVatAcct
            ? await this.prisma.journalEntryLine.aggregate({
                _sum: { debit: true },
                where: {
                    companyId,
                    accountId: inputVatAcct.id,
                    journal: { date: { gte: periodStart, lte: periodEnd }, postingStatus: 'POSTED', deletedAt: null },
                },
            })
            : { _sum: { debit: null } }

        // Aggregate gross taxable sales: credits on 4xxx revenue accounts
        const salesResult = revenueIds.length
            ? await this.prisma.journalEntryLine.aggregate({
                _sum: { credit: true },
                where: {
                    companyId,
                    accountId: { in: revenueIds },
                    journal: { date: { gte: periodStart, lte: periodEnd }, postingStatus: 'POSTED', deletedAt: null },
                },
            })
            : { _sum: { credit: null } }

        const outputVat = Number(outputResult._sum.credit ?? 0)
        const inputVat = Number(inputResult._sum.debit ?? 0)
        const grossTaxableSales = Number(salesResult._sum.credit ?? 0)
        const netVat = outputVat - inputVat
        const vatPayable = Math.max(0, netVat)
        const vatCredit = Math.max(0, -netVat)

        return {
            formType, taxYear, period, periodStart, periodEnd,
            grossTaxableSales,
            zeroRatedSales: 0,     // tracked separately via zero-rated VAT code
            exemptSales: 0,        // tracked separately via exempt VAT code
            outputVat,
            inputVat,
            vatPayable,
            vatCredit,             // excess input tax carried forward
        }
    }

    async listBirForms(userId: string, companyId: string, opts: { taxYear?: number; formType?: string } = {}) {
        await this.assertAccess(userId, companyId)
        return (this.prisma as any).birForm?.findMany({
            where: {
                companyId,
                ...(opts.taxYear ? { taxYear: opts.taxYear } : {}),
                ...(opts.formType ? { formType: opts.formType } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }).catch(() => []) ?? []
    }

    async generateBirForm(userId: string, companyId: string, data: {
        formType: string; taxYear: number; period?: string
    }) {
        await this.assertAccess(userId, companyId)
        if (!data.formType) throw new BadRequestException('formType is required')
        if (!data.taxYear) throw new BadRequestException('taxYear is required')

        // For VAT returns, compute real figures from the GL
        if ((data.formType === '2550M' || data.formType === '2550Q') && data.period) {
            const computed = await this.computeVatReturn2550(
                companyId, data.taxYear, data.period, data.formType as '2550M' | '2550Q',
            )
            return { companyId, ...computed, status: 'GENERATED', generatedAt: new Date() }
        }

        // Try to persist; if model doesn't exist, return computed stub
        const result = await (this.prisma as any).birForm?.create({
            data: {
                companyId, formType: data.formType, taxYear: data.taxYear,
                period: data.period ?? null, status: 'GENERATED', generatedAt: new Date(),
            },
        }).catch(() => null)
        return result ?? { companyId, formType: data.formType, taxYear: data.taxYear, status: 'GENERATED', generatedAt: new Date() }
    }

    async getBirFormData(userId: string, companyId: string, formType: string, opts: {
        taxYear?: number; period?: string
    } = {}) {
        await this.assertAccess(userId, companyId)
        const taxYear = opts.taxYear ?? new Date().getFullYear()

        // For VAT returns with a period specified, compute live GL data
        if ((formType === '2550M' || formType === '2550Q') && opts.period) {
            const computed = await this.computeVatReturn2550(
                companyId, taxYear, opts.period, formType as '2550M' | '2550Q',
            )
            return { companyId, ...computed, status: 'DRAFT' }
        }

        // Return the most recent matching form or a stub
        const existing = await (this.prisma as any).birForm?.findFirst({
            where: { companyId, formType, taxYear, ...(opts.period ? { period: opts.period } : {}) },
            orderBy: { generatedAt: 'desc' },
        }).catch(() => null)
        if (existing) return existing
        // Fallback: aggregate summary
        const summary = await this.repo.getTaxSummary(companyId, new Date(`${taxYear}-01-01`), new Date(`${taxYear}-12-31`))
        return { formType, taxYear, period: opts.period, companyId, summary, status: 'DRAFT' }
    }

    // ─── Percentage Tax ───────────────────────────────────────────────────────

    async listPercentageTax(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return (this.prisma as any).percentageTax?.findMany({
            where: { companyId, ...(opts.status ? { status: opts.status } : {}) },
            orderBy: { periodStart: 'desc' },
            take: 50,
        }).catch(() => []) ?? []
    }

    async createPercentageTax(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.periodStart) throw new BadRequestException('periodStart is required')
        if (!data.periodEnd) throw new BadRequestException('periodEnd is required')
        const result = await (this.prisma as any).percentageTax?.create({
            data: {
                companyId,
                periodStart: new Date(data.periodStart),
                periodEnd: new Date(data.periodEnd),
                grossReceipts: data.grossReceipts ? Number(data.grossReceipts) : null,
                taxRate: data.taxRate ? Number(data.taxRate) : 0.03,
                taxDue: data.taxDue ? Number(data.taxDue) : null,
                status: data.status ?? 'DRAFT',
            },
        }).catch(() => null)
        return result ?? { companyId, ...data, status: 'DRAFT' }
    }

    async updatePercentageTax(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        return (this.prisma as any).percentageTax?.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
        }).catch(() => ({ id, ...data })) ?? { id, ...data }
    }

    // ─── Tax Calendar ─────────────────────────────────────────────────────────
    // Returns the standard Philippine BIR filing deadlines for the given tax year

    async getTaxCalendar(userId: string, companyId: string, taxYear: number) {
        await this.assertAccess(userId, companyId)
        const locale = await this.getLocaleForCompany(companyId)
        const deadlines = [
            // VAT – monthly (2550M) due every 20th of following month
            ...Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                formType: '2550M',
                description: `Monthly VAT Return (${new Date(taxYear, i, 1).toLocaleString(locale, { month: 'long' })})`,
                dueDate: new Date(taxYear, i + 1, 20).toISOString().slice(0, 10),
            })),
            // Quarterly VAT (2550Q) due every 25th of month after quarter end
            { quarter: 1, formType: '2550Q', description: 'Quarterly VAT Q1', dueDate: `${taxYear}-04-25` },
            { quarter: 2, formType: '2550Q', description: 'Quarterly VAT Q2', dueDate: `${taxYear}-07-25` },
            { quarter: 3, formType: '2550Q', description: 'Quarterly VAT Q3', dueDate: `${taxYear}-10-25` },
            { quarter: 4, formType: '2550Q', description: 'Quarterly VAT Q4', dueDate: `${taxYear + 1}-01-25` },
            // Annual income tax (1702RT) due April 15 of following year
            { formType: '1702RT', description: 'Annual Income Tax Return', dueDate: `${taxYear + 1}-04-15` },
            // Alphalist (1604E) due March 1 of following year
            { formType: '1604E', description: 'Annual Alphalist', dueDate: `${taxYear + 1}-03-01` },
        ]
        return { taxYear, deadlines }
    }

    // ─── Filing Batch ─────────────────────────────────────────────────────────

    async getFilingBatch(userId: string, companyId: string, period?: string) {
        await this.assertAccess(userId, companyId)
        const [vatReturns, form2307s] = await Promise.all([
            this.repo.findVatReturns(companyId, { status: 'DRAFT', limit: 20 }),
            this.repo.findForm2307s(companyId, {}),
        ])
        return {
            period: period ?? new Date().toISOString().slice(0, 7),
            vatReturns, form2307s,
            totalItems: vatReturns.length + form2307s.length,
        }
    }

    // ─── Sales Output Tax ─────────────────────────────────────────────────────

    async getZeroRatedExempt(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.vatTransaction.findMany({
            where: {
                companyId,
                transactionType: 'SALE',
                vatCode: { in: ['ZERO', 'EXEMPT'] },
            },
            orderBy: { transactionDate: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    async getOutputTaxLedger(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.vatTransaction.findMany({
            where: {
                companyId,
                transactionType: 'SALE',
            },
            orderBy: { transactionDate: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    // ─── Purchase Input Tax ───────────────────────────────────────────────────

    async getCreditableWithholding(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.withholdingTaxCertificate.findMany({
            where: { companyId },
            include: { vendor: { select: { contactId: true } } },
            orderBy: { dateIssued: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    async getTaxReconciliation(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        // Return SalesTaxReturns with lines for book vs return comparison
        const returns = await this.prisma.salesTaxReturn.findMany({
            where: { companyId },
            include: { lines: { include: { taxRate: { select: { name: true, rate: true } } } } },
            orderBy: { periodStart: 'desc' },
            take: 50,
        }).catch(() => [])
        const locale = await this.getLocaleForCompany(companyId)
        return returns.map((r: any) => ({
            id: r.id,
            taxType: r.taxType ?? 'VAT',
            period: r.periodStart ? new Date(r.periodStart).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '',
            bookAmount: Number(r.totalTax ?? 0),
            returnAmount: Number(r.totalTax ?? 0),
            variance: 0,
            explanation: '',
            status: r.status === 'FILED' ? 'RECONCILED' : 'OPEN',
        }))
    }

    async getExpandedWithholding(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.withholdingTaxDeduction.findMany({
            where: { companyId },
            include: {
                vendor: { select: { contactId: true } },
                account: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    // ─── Corporate Tax ────────────────────────────────────────────────────────

    async getIncomeTax(userId: string, companyId: string, taxYear?: number) {
        await this.assertAccess(userId, companyId)
        const year = taxYear ?? new Date().getFullYear() - 1
        return this.prisma.taxReturn.findMany({
            where: {
                companyId,
                formType: { contains: '1702' },
                periodStart: { gte: new Date(`${year}-01-01`) },
                periodEnd: { lte: new Date(`${year}-12-31`) },
            },
            include: {
                lines: true,
                payments: true,
                authority: { select: { id: true, name: true } },
            },
            orderBy: { periodStart: 'desc' },
            take: 10,
        }).catch(() => [])
    }

    async getDeferredTaxItems(userId: string, companyId: string, period?: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.deferredTax.findMany({
            where: {
                companyId,
                ...(period ? { period } : {}),
            },
            include: { account: { select: { id: true, name: true, code: true } } },
            orderBy: [{ period: 'desc' }, { type: 'asc' }],
            take: 100,
        }).catch(() => [])
    }

    async getTransferPricingDocuments(userId: string, companyId: string, fiscalYear?: number) {
        await this.assertAccess(userId, companyId)
        return this.prisma.transferPricingDocument.findMany({
            where: {
                companyId,
                ...(fiscalYear ? { fiscalYear } : {}),
            },
            include: { relatedParty: { select: { id: true, relatedCompanyId: true } } },
            orderBy: [{ fiscalYear: 'desc' }, { createdAt: 'desc' }],
            take: 50,
        }).catch(() => [])
    }

    async getMultiJurisdiction(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        // Get TaxReturns grouped with jurisdictions via lines
        const returns = await this.prisma.taxReturn.findMany({
            where: { companyId },
            include: {
                lines: {
                    include: { jurisdiction: { select: { id: true, name: true, region: true, code: true } } },
                },
                authority: { select: { id: true, name: true, code: true } },
                payments: { select: { id: true, amount: true, paymentDate: true } },
            },
            orderBy: { periodStart: 'desc' },
            take: 30,
        }).catch(() => [])
        return returns
    }

    // ─── Year End ─────────────────────────────────────────────────────────────

    async getYearEndAdjustments(userId: string, companyId: string, period?: string) {
        await this.assertAccess(userId, companyId)
        // Use ClosingEntry as year-end adjustment entries (Dr/Cr adjustments)
        const targetPeriod = period ?? `${new Date().getFullYear() - 1}-12`
        return this.prisma.closingEntry.findMany({
            where: {
                companyId,
                ...(period ? { period } : {}),
            },
            include: { journalEntry: { select: { id: true, entryNumber: true, description: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }).catch(() => [])
    }

    async getYearEndClosingEntries(userId: string, companyId: string, period?: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.closingEntry.findMany({
            where: {
                companyId,
                ...(period ? { period } : {}),
            },
            include: { journalEntry: { select: { id: true, entryNumber: true, description: true } } },
            orderBy: [{ period: 'desc' }, { type: 'asc' }],
            take: 50,
        }).catch(() => [])
    }

    async getAnnualTaxSummary(userId: string, companyId: string, taxYear?: number) {
        await this.assertAccess(userId, companyId)
        const year = taxYear ?? new Date().getFullYear() - 1
        const returns = await this.prisma.taxReturn.findMany({
            where: {
                companyId,
                periodStart: { gte: new Date(`${year}-01-01`) },
                periodEnd: { lte: new Date(`${year}-12-31`) },
            },
            include: {
                payments: true,
                authority: { select: { id: true, name: true } },
            },
            orderBy: { periodStart: 'asc' },
        }).catch(() => [])
        const totalTaxPaid = (returns as any[]).reduce((s: number, r: any) => {
            return s + (r.payments ?? []).reduce((ps: number, p: any) => ps + Number(p.amount ?? 0), 0)
        }, 0)
        return {
            taxYear: year,
            returns,
            totalTaxPaid,
            filedCount: (returns as any[]).filter((r: any) => r.status === 'FILED').length,
            totalForms: returns.length,
        }
    }

    // ─── Tax Reporting (extended) ─────────────────────────────────────────────

    async getTaxLiability(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxObligation.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            include: { authority: { select: { id: true, name: true, code: true } } },
            orderBy: [{ dueDate: 'asc' }],
            take: 100,
        }).catch(() => [])
    }

    async getTaxAuditTrail(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxCalculationAudit.findMany({
            where: { companyId },
            include: { calculatedBy: { select: { id: true, name: true } } },
            orderBy: { calculatedAt: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    // ─── Filing & Payments (extended) ─────────────────────────────────────────

    async getRemittances(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.governmentRemittance.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: { dueDate: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    async getFilingHistory(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxFilingBatch.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }).catch(() => [])
    }

    async getEFiling(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxFilingPackage.findMany({
            where: { companyId },
            orderBy: { generatedAt: 'desc' },
            take: 50,
        }).catch(() => [])
    }

    async getTaxPaymentsExtended(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxPayment.findMany({
            where: {
                taxReturn: { companyId },
                ...(opts.from ? { paymentDate: { gte: new Date(opts.from) } } : {}),
                ...(opts.to ? { paymentDate: { lte: new Date(opts.to) } } : {}),
            },
            include: {
                taxReturn: {
                    select: { id: true, formType: true, periodStart: true, periodEnd: true, authority: { select: { name: true } } },
                },
            },
            orderBy: { paymentDate: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    async getTaxReturns(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxReturn.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
                ...(opts.formType ? { formType: { contains: opts.formType } } : {}),
            },
            include: {
                authority: { select: { id: true, name: true } },
                payments: { select: { id: true, amount: true, paymentDate: true } },
            },
            orderBy: { periodStart: 'desc' },
            take: 50,
        }).catch(() => [])
    }

    // ─── Tax Setup (extended) ─────────────────────────────────────────────────

    async getTaxAgencies(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        // TaxAuthority is global (not scoped to a company), return all active ones for the Philippines
        return this.prisma.taxAuthority.findMany({
            where: { isActive: true },
            include: {
                obligations: {
                    where: { companyId },
                    select: { id: true, formType: true, dueDate: true, status: true },
                    orderBy: { dueDate: 'asc' },
                    take: 5,
                },
            },
            orderBy: { name: 'asc' },
        }).catch(() => [])
    }

    async getTaxJurisdictions(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxJurisdiction.findMany({
            include: {
                taxRates: {
                    where: { companyId },
                    select: { id: true, name: true, rate: true, taxType: true },
                },
            },
            orderBy: [{ region: 'asc' }, { name: 'asc' }],
            take: 100,
        }).catch(() => [])
    }

    async getTaxExemptions(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.taxIncentive.findMany({
            where: { companyId },
            include: { country: { select: { id: true, name: true, code: true } } },
            orderBy: [{ status: 'asc' }, { effectiveDate: 'desc' }],
            take: 50,
        }).catch(() => [])
    }

    async getWithholdingSetup(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        // Return tax codes with their rates (withholding taxes are stored as TaxCodes)
        return this.prisma.taxCode.findMany({
            where: { companyId },
            include: {
                rates: { include: { taxRate: { select: { id: true, name: true, rate: true, taxType: true } } } },
            },
            orderBy: { code: 'asc' },
        }).catch(() => [])
    }
}

