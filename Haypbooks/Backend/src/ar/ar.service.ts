import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ArRepository } from './ar.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Injectable()
export class ArService {
    constructor(
        private readonly repo: ArRepository,
        private readonly prisma: PrismaService,
        private readonly subLedger: SubLedgerService,
    ) { }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private async getWorkspaceId(companyId: string): Promise<string> {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const member = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!member) throw new ForbiddenException('Access denied')
        return member
    }

    // ─── Helpers: Normalization ──────────────────────────────────────────────

    private normalizeCustomer(c: any) {
        return {
            ...c,
            name: c.contact?.displayName ?? c.name ?? '',
            displayName: c.contact?.displayName ?? c.name ?? '',
            email: c.contact?.contactEmails?.[0]?.email ?? c.email ?? '',
            phone: c.contact?.contactPhones?.[0]?.phone ?? c.phone ?? '',
            balance: Number(c.balance ?? 0),
        }
    }

    private normalizeInvoice(inv: any) {
        return {
            ...inv,
            total: Number(inv.totalAmount ?? inv.total ?? 0),
            amountDue: Number(inv.balance ?? inv.amountDue ?? 0),
            customerName: inv.customer?.contact?.displayName ?? inv.customerName ?? '',
            items: (inv.lines ?? inv.items ?? []).map((l: any) => ({
                ...l,
                unitPrice: Number(l.unitPrice ?? l.rate ?? 0),
                amount: Number(l.totalPrice ?? l.amount ?? 0),
            })),
        }
    }

    private normalizePayment(p: any) {
        return {
            ...p,
            paymentNumber: p.referenceNumber ?? p.paymentNumber ?? '',
            date: p.paymentDate ?? p.date,
            customerName: p.customer?.contact?.displayName ?? p.customerName ?? '',
            method: p.paymentMethodId ?? p.method ?? '',
        }
    }

    // ─── Customers ────────────────────────────────────────────────────────────

    async listCustomers(userId: string, companyId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customers = await this.repo.findCustomers(wid, opts)
        return customers.map((c: any) => this.normalizeCustomer(c))
    }

    async getCustomer(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.findCustomerById(wid, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        return this.normalizeCustomer(customer)
    }

    async createCustomer(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const displayName = data.displayName || data.name
        if (!displayName) throw new BadRequestException('displayName is required')
        const result = await this.repo.createCustomer(wid, { ...data, displayName })
        return this.normalizeCustomer(result)
    }

    async updateCustomer(userId: string, companyId: string, contactId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.findCustomerById(wid, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        if (data.name && !data.displayName) data.displayName = data.name
        const result = await this.repo.updateCustomer(wid, contactId, data)
        return this.normalizeCustomer(result)
    }

    async deleteCustomer(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.findCustomerById(wid, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        return this.repo.softDeleteCustomer(wid, contactId)
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    async listQuotes(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findQuotes(companyId, {
            customerId: opts.customerId,
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getQuote(userId: string, companyId: string, quoteId: string) {
        await this.assertAccess(userId, companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        return q
    }

    async createQuote(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.customerId) throw new BadRequestException('customerId is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line item is required')
        return this.repo.createQuote({ workspaceId, companyId, ...data })
    }

    async updateQuoteStatus(userId: string, companyId: string, quoteId: string, status: string) {
        await this.assertAccess(userId, companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        const allowed = ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']
        if (!allowed.includes(status)) throw new BadRequestException(`Invalid status: ${status}`)
        return this.repo.updateQuoteStatus(companyId, quoteId, status)
    }

    async convertToInvoice(userId: string, companyId: string, quoteId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        if (q.status === 'CONVERTED') throw new BadRequestException('Quote is already converted to an invoice')
        if (q.status === 'EXPIRED' || q.status === 'REJECTED') throw new BadRequestException('Cannot convert a rejected or expired quote')
        const invoice = await this.repo.convertQuoteToInvoice(companyId, workspaceId, quoteId, userId)
        if (!invoice) throw new BadRequestException('Conversion failed')
        return invoice
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    async listInvoices(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const invoices = await this.repo.findInvoices(companyId, {
            customerId: opts.customerId,
            status: opts.status,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return invoices.map((inv: any) => this.normalizeInvoice(inv))
    }

    async getInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const inv = await this.repo.findInvoiceById(companyId, invoiceId)
        if (!inv) throw new NotFoundException('Invoice not found')
        return this.normalizeInvoice(inv)
    }

    async createInvoice(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.customerId) throw new BadRequestException('customerId is required')
        const lines = data.lines ?? data.items
        if (!lines?.length) throw new BadRequestException('At least one line item is required')
        const result = await this.repo.createInvoice({
            workspaceId,
            companyId,
            customerId: data.customerId,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            paymentTermId: data.paymentTermId,
            currency: data.currency,
            createdById: userId,
            lines: lines.map((l: any) => ({
                description: l.description,
                quantity: l.quantity ?? 1,
                unitPrice: l.unitPrice ?? l.rate ?? 0,
                amount: l.amount ?? l.totalPrice ?? (Number(l.quantity ?? 1) * Number(l.unitPrice ?? l.rate ?? 0)),
                itemId: l.itemId ?? null,
                accountId: l.accountId ?? null,
            })),
        })
        return this.normalizeInvoice(result)
    }

    async updateInvoice(userId: string, companyId: string, invoiceId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.updateInvoice(companyId, invoiceId, data, userId)
        if (!result) throw new BadRequestException('Invoice not found or cannot be edited (only DRAFT invoices can be updated)')
        return result
    }

    async sendInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.sendInvoice(companyId, invoiceId)
        if (!result) throw new NotFoundException('Invoice not found')
        // Post invoice to the General Ledger (DR: AR, CR: Revenue + Output VAT)
        await this.subLedger.postInvoiceToGL(result.id, userId)
        return result
    }

    async voidInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const inv = await this.repo.findInvoiceById(companyId, invoiceId)
        if (!inv) throw new NotFoundException('Invoice not found')
        if (inv.status === 'VOID') throw new BadRequestException('Invoice is already void')
        if (Number(inv.totalAmount) - Number(inv.balance) > 0) {
            throw new BadRequestException('Cannot void an invoice that has payments applied. Void the payments first.')
        }
        return this.repo.voidInvoice(companyId, invoiceId)
    }

    // ─── Payments ─────────────────────────────────────────────────────────────

    async listPayments(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const payments = await this.repo.findPayments(companyId, {
            customerId: opts.customerId,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return payments.map((p: any) => this.normalizePayment(p))
    }

    async getPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const p = await this.repo.findPaymentById(companyId, paymentId)
        if (!p) throw new NotFoundException('Payment not found')
        return this.normalizePayment(p)
    }

    async recordPayment(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        // Build applications: accept either applications[] array or flat invoiceId
        let applications = data.applications ?? []
        if (!applications.length && data.invoiceId) {
            applications = [{ invoiceId: data.invoiceId, amount: data.amount }]
        }

        // Resolve customerId from invoice if not provided
        let customerId = data.customerId
        if (!customerId && applications.length > 0) {
            const invoice = await this.prisma.invoice.findUnique({ where: { id: applications[0].invoiceId }, select: { customerId: true } })
            if (invoice) customerId = invoice.customerId
        }
        if (!customerId) throw new BadRequestException('customerId is required')
        if (!data.amount || Number(data.amount) <= 0) throw new BadRequestException('amount must be greater than 0')
        const paymentDate = data.paymentDate ?? data.date
        if (!paymentDate) throw new BadRequestException('paymentDate is required')

        const totalApplied = applications.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0)
        if (totalApplied > Number(data.amount) + 0.01) {
            throw new BadRequestException(`Total applied (${totalApplied}) exceeds payment amount (${data.amount})`)
        }

        const result = await this.repo.recordPayment({
            workspaceId,
            companyId,
            customerId,
            amount: data.amount,
            paymentDate: new Date(paymentDate),
            referenceNumber: data.referenceNumber ?? data.reference,
            paymentMethodId: data.paymentMethodId ?? data.method,
            bankAccountId: data.bankAccountId,
            createdById: userId,
            applications,
        })
        // Post payment receipt to the General Ledger (DR: Cash/Bank, CR: Accounts Receivable)
        await this.subLedger.postPaymentReceivedToGL(result.id, userId)
        return this.normalizePayment(result)
    }

    async voidPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.voidPayment(companyId, paymentId)
        if (!result) throw new NotFoundException('Payment not found')
        return result
    }

    // ─── AR Aging ─────────────────────────────────────────────────────────────

    async getArAging(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const raw = await this.repo.getArAging(companyId)

        // Provide both original bucket names and frontend-expected aliases
        const summary = {
            current: raw.buckets.current,
            days1to30: raw.buckets.days1_30,
            days31to60: raw.buckets.days31_60,
            days61to90: raw.buckets.days61_90,
            over90: raw.buckets.over90,
            total: raw.buckets.current + raw.buckets.days1_30 + raw.buckets.days31_60 + raw.buckets.days61_90 + raw.buckets.over90,
        }

        // Group rows by customer for the frontend aging table
        const customerMap = new Map<string, any>()
        for (const row of raw.rows) {
            const custId = row.customer?.contactId ?? row.id
            const custName = row.customer?.contact?.displayName ?? ''
            if (!customerMap.has(custId)) {
                customerMap.set(custId, { customerId: custId, customerName: custName, current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 })
            }
            const entry = customerMap.get(custId)!
            const bal = Number(row.balance ?? 0)
            const daysOverdue = row.daysOverdue ?? 0
            if (daysOverdue <= 0) entry.current += bal
            else if (daysOverdue <= 30) entry.days30 += bal
            else if (daysOverdue <= 60) entry.days60 += bal
            else if (daysOverdue <= 90) entry.days90 += bal
            else entry.over90 += bal
            entry.total += bal
        }

        // Provide bucket array for ArAgingPage
        const buckets = [
            { label: 'Current', amount: summary.current, count: 0 },
            { label: '1-30 Days', amount: summary.days1to30, count: 0 },
            { label: '31-60 Days', amount: summary.days31to60, count: 0 },
            { label: '61-90 Days', amount: summary.days61to90, count: 0 },
            { label: 'Over 90 Days', amount: summary.over90, count: 0 },
        ]

        return {
            ...raw,
            summary,
            buckets,
            customers: Array.from(customerMap.values()),
        }
    }
}
