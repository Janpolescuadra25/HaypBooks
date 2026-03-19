import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { resolveAccount, createAndPostJE, createReversingJE, SYSTEM_ACCOUNTS } from '../shared/gl-integration'

@Injectable()
export class ArRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Contacts / Customers ─────────────────────────────────────────────────

    async findCustomers(workspaceId: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.customer.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                ...(opts.search ? {
                    contact: { displayName: { contains: opts.search, mode: 'insensitive' } },
                } : {}),
            },
            include: {
                contact: {
                    select: { id: true, displayName: true, contactEmails: true, contactPhones: true },
                },
            },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
            orderBy: { contact: { displayName: 'asc' } },
        })
    }

    async findCustomerById(workspaceId: string, contactId: string) {
        return this.prisma.customer.findFirst({
            where: { contactId, workspaceId, deletedAt: null },
            include: {
                contact: { include: { contactEmails: true, contactPhones: true } },
                paymentTerm: true,
            },
        })
    }

    async createCustomer(workspaceId: string, data: {
        displayName: string
        email?: string
        phone?: string
        paymentTermId?: string
        creditLimit?: number
    }) {
        return this.prisma.$transaction(async (tx) => {
            const contact = await tx.contact.create({
                data: {
                    workspaceId,
                    type: 'CUSTOMER',
                    displayName: data.displayName,
                    ...(data.email ? {
                        contactEmails: { create: [{ email: data.email, type: 'WORK', isPrimary: true }] },
                    } : {}),
                    ...(data.phone ? {
                        contactPhones: { create: [{ phone: data.phone, type: 'WORK', isPrimary: true }] },
                    } : {}),
                },
            })
            const customer = await tx.customer.create({
                data: {
                    contactId: contact.id,
                    workspaceId,
                    paymentTermId: data.paymentTermId ?? null,
                    creditLimit: data.creditLimit ?? null,
                },
            })
            return { ...customer, contact }
        })
    }

    async updateCustomer(workspaceId: string, contactId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            if (data.displayName) {
                await tx.contact.update({ where: { id: contactId }, data: { displayName: data.displayName } })
            }
            return tx.customer.update({
                where: { contactId },
                data: {
                    paymentTermId: data.paymentTermId,
                    creditLimit: data.creditLimit,
                },
                include: { contact: true },
            })
        })
    }

    async softDeleteCustomer(workspaceId: string, contactId: string) {
        await this.prisma.customer.update({ where: { contactId }, data: { deletedAt: new Date() } })
        return { success: true }
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    async findQuotes(companyId: string, opts: { customerId?: string; status?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.quote.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: {
                customer: { include: { contact: { select: { id: true, displayName: true } } } },
                lines: true,
            },
            orderBy: { issuedAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findQuoteById(companyId: string, quoteId: string) {
        return this.prisma.quote.findFirst({
            where: { id: quoteId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: { select: { displayName: true, contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
            },
        })
    }

    async createQuote(data: {
        workspaceId: string, companyId: string, customerId: string, expiryDate?: Date, lines: any[]
    }) {
        const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.quote.create({
            data: {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                customerId: data.customerId,
                totalAmount,
                expiryDate: data.expiryDate ?? null,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId,
                        description: l.description,
                        quantity: l.quantity ?? 1,
                        unitPrice: l.unitPrice ?? 0,
                        amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                        itemId: l.itemId ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateQuoteStatus(companyId: string, quoteId: string, status: string) {
        return this.prisma.quote.update({ where: { id: quoteId }, data: { status: status as any } })
    }

    async convertQuoteToInvoice(companyId: string, workspaceId: string, quoteId: string, createdById: string) {
        const quote = await this.prisma.quote.findFirst({
            where: { id: quoteId, companyId, deletedAt: null },
            include: { lines: true },
        })
        if (!quote) return null

        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    workspaceId,
                    companyId,
                    customerId: quote.customerId,
                    totalAmount: quote.totalAmount,
                    balance: quote.totalAmount,
                    date: new Date(),
                    status: 'DRAFT',
                    postingStatus: 'DRAFT',
                    createdById,
                    lines: {
                        create: quote.lines.map((l) => ({
                            companyId,
                            workspaceId,
                            description: l.description,
                            quantity: l.quantity,
                            unitPrice: l.unitPrice,
                            totalPrice: l.amount,
                        })),
                    },
                },
                include: { lines: true },
            })
            // Mark quote as converted
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'CONVERTED', convertedToInvoiceId: invoice.id, acceptedAt: new Date() },
            })
            return invoice
        })
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    async findInvoices(companyId: string, opts: {
        customerId?: string, status?: string, from?: Date, to?: Date, limit?: number, offset?: number
    } = {}) {
        return this.prisma.invoice.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
                ...(opts.from || opts.to ? {
                    date: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                lines: { select: { id: true, description: true, quantity: true, unitPrice: true, totalPrice: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findInvoiceById(companyId: string, invoiceId: string) {
        return this.prisma.invoice.findFirst({
            where: { id: invoiceId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: { include: { contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
                InvoicePaymentApplication: { include: { payment: true } },
                createdBy: { select: { id: true, name: true } },
                journalEntry: { select: { id: true, entryNumber: true, postingStatus: true } },
            },
        })
    }

    async createInvoice(data: {
        workspaceId: string, companyId: string, customerId: string, dueDate?: Date,
        paymentTermId?: string, currency?: string, createdById: string, lines: any[]
    }) {
        const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.invoice.create({
            data: {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                customerId: data.customerId,
                status: 'DRAFT',
                postingStatus: 'DRAFT',
                totalAmount,
                balance: totalAmount,
                currency: data.currency ?? 'PHP',
                date: new Date(),
                dueDate: data.dueDate ?? null,
                paymentTermId: data.paymentTermId ?? null,
                createdById: data.createdById,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId,
                        workspaceId: data.workspaceId,
                        description: l.description,
                        quantity: l.quantity ?? 1,
                        unitPrice: l.unitPrice ?? 0,
                        totalPrice: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                        itemId: l.itemId ?? null,
                        discountPercent: l.discountPercent ?? null,
                        discountAmount: l.discountAmount ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateInvoice(companyId: string, invoiceId: string, data: any, updatedById: string) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId, deletedAt: null } })
        if (!invoice || invoice.status !== 'DRAFT') return null

        return this.prisma.$transaction(async (tx) => {
            if (data.lines) {
                await tx.invoiceLine.deleteMany({ where: { invoiceId } })
            }
            const totalAmount = data.lines
                ? data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
                : invoice.totalAmount

            return tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    customerId: data.customerId,
                    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                    paymentTermId: data.paymentTermId,
                    currency: data.currency,
                    totalAmount,
                    balance: totalAmount,
                    updatedById,
                    ...(data.lines ? {
                        lines: {
                            create: data.lines.map((l: any) => ({
                                companyId,
                                workspaceId: invoice.workspaceId,
                                description: l.description,
                                quantity: l.quantity ?? 1,
                                unitPrice: l.unitPrice ?? 0,
                                totalPrice: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                                itemId: l.itemId ?? null,
                            })),
                        },
                    } : {}),
                } as any,
                include: { lines: true },
            })
        })
    }

    async sendInvoice(companyId: string, invoiceId: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, companyId },
            include: { lines: true },
        })
        if (!invoice) return null
        const invoiceNumber = invoice.invoiceNumber ?? `INV-${Date.now()}`

        return this.prisma.$transaction(async (tx) => {
            // Resolve system accounts
            const arAcct  = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE)
            const revAcct = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.SERVICE_REVENUE)

            const total = Number(invoice.totalAmount)

            // Create & post JE: Dr Accounts Receivable, Cr Revenue
            const jeId = await createAndPostJE(tx, {
                workspaceId: invoice.workspaceId,
                companyId,
                date: invoice.date ?? new Date(),
                description: `Invoice ${invoiceNumber}`,
                createdById: invoice.createdById ?? 'system',
                lines: [
                    { accountId: arAcct.id,  debit: total, credit: 0, description: `AR – ${invoiceNumber}` },
                    { accountId: revAcct.id, debit: 0, credit: total, description: `Revenue – ${invoiceNumber}` },
                ],
            })

            return tx.invoice.update({
                where: { id: invoiceId },
                data: { status: 'SENT', invoiceNumber, journalEntryId: jeId, postingStatus: 'POSTED' },
            })
        })
    }

    async voidInvoice(companyId: string, invoiceId: string) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId } })
        if (!invoice) return null

        return this.prisma.$transaction(async (tx) => {
            // Reverse the JE if one was posted
            if (invoice.journalEntryId) {
                await createReversingJE(tx, companyId, invoice.journalEntryId, `Void invoice ${invoice.invoiceNumber ?? invoiceId}`)
            }
            return tx.invoice.update({
                where: { id: invoiceId },
                data: { status: 'VOID', postingStatus: 'VOIDED', deletedAt: new Date() },
            })
        })
    }

    // ─── Payments Received ────────────────────────────────────────────────────

    async findPayments(companyId: string, opts: {
        customerId?: string, from?: Date, to?: Date, limit?: number, offset?: number
    } = {}) {
        return this.prisma.paymentReceived.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.from || opts.to ? {
                    paymentDate: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                InvoicePaymentApplication: { include: { invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } } } },
            },
            orderBy: { paymentDate: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findPaymentById(companyId: string, paymentId: string) {
        return this.prisma.paymentReceived.findFirst({
            where: { id: paymentId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: true } },
                InvoicePaymentApplication: { include: { invoice: true } },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
        })
    }

    async recordPayment(data: {
        workspaceId: string, companyId: string, customerId: string,
        amount: number, paymentDate: Date, referenceNumber?: string,
        paymentMethodId?: string, bankAccountId?: string, createdById: string,
        applications: Array<{ invoiceId: string, amount: number }>
    }) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.paymentReceived.create({
                data: {
                    workspaceId: data.workspaceId,
                    companyId: data.companyId,
                    customerId: data.customerId,
                    amount: data.amount,
                    paymentDate: data.paymentDate,
                    referenceNumber: data.referenceNumber ?? null,
                    paymentMethodId: data.paymentMethodId ?? null,
                    bankAccountId: data.bankAccountId ?? null,
                    createdById: data.createdById,
                },
            })

            // Apply payment to invoices
            for (const app of data.applications ?? []) {
                await tx.invoicePaymentApplication.create({
                    data: {
                        workspaceId: data.workspaceId,
                        invoiceId: app.invoiceId,
                        paymentId: payment.id,
                        amount: app.amount,
                    },
                })
                // Update invoice balance
                const invoice = await tx.invoice.findUnique({ where: { id: app.invoiceId } })
                if (invoice) {
                    const newBalance = Math.max(0, Number(invoice.balance) - Number(app.amount))
                    const newStatus = newBalance <= 0 ? 'PAID' : (Number(app.amount) > 0 ? 'PARTIAL' : invoice.status)
                    await tx.invoice.update({
                        where: { id: app.invoiceId },
                        data: { balance: newBalance, status: newStatus as any, paymentStatus: newBalance <= 0 ? 'PAID' : 'PARTIAL' as any },
                    })
                }
            }

            // GL: Dr Cash/Bank, Cr Accounts Receivable
            const cashAcct = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.CASH)
            const arAcct   = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE)
            const jeId = await createAndPostJE(tx, {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                date: data.paymentDate,
                description: `Payment received – ${data.referenceNumber ?? payment.id}`,
                createdById: data.createdById,
                lines: [
                    { accountId: cashAcct.id, debit: data.amount, credit: 0, description: 'Cash received' },
                    { accountId: arAcct.id,   debit: 0, credit: data.amount, description: 'AR applied' },
                ],
            })
            return tx.paymentReceived.update({ where: { id: payment.id }, data: { journalEntryId: jeId } })
        })
    }

    async voidPayment(companyId: string, paymentId: string) {
        const payment = await this.prisma.paymentReceived.findFirst({ where: { id: paymentId, companyId, deletedAt: null } })
        if (!payment) return null

        return this.prisma.$transaction(async (tx) => {
            // Reverse invoice applications
            const applications = await tx.invoicePaymentApplication.findMany({ where: { paymentId } })
            for (const app of applications) {
                const invoice = await tx.invoice.findUnique({ where: { id: app.invoiceId } })
                if (invoice && invoice.status !== 'VOID') {
                    const restoredBalance = Number(invoice.balance) + Number(app.amount)
                    await tx.invoice.update({
                        where: { id: app.invoiceId },
                        data: {
                            balance: restoredBalance,
                            status: restoredBalance >= Number(invoice.totalAmount) ? 'SENT' : 'PARTIAL' as any,
                            paymentStatus: 'PARTIAL' as any,
                        },
                    })
                }
                await tx.invoicePaymentApplication.delete({ where: { id: app.id } })
            }

            // Reverse the JE
            if (payment.journalEntryId) {
                await createReversingJE(tx, companyId, payment.journalEntryId, `Void payment ${paymentId}`)
            }

            return tx.paymentReceived.update({ where: { id: paymentId }, data: { deletedAt: new Date() } })
        })
    }

    // ─── Aging Report ─────────────────────────────────────────────────────────

    async getArAging(companyId: string) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                companyId,
                deletedAt: null,
                status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] as any },
                balance: { gt: 0 },
            },
            select: {
                id: true, invoiceNumber: true, date: true, dueDate: true, totalAmount: true, balance: true,
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })

        const today = new Date()
        const buckets = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0 }

        const rows = invoices.map((inv) => {
            const daysOverdue = inv.dueDate ? Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000) : 0
            const bal = Number(inv.balance)
            if (daysOverdue <= 0) buckets.current += bal
            else if (daysOverdue <= 30) buckets.days1_30 += bal
            else if (daysOverdue <= 60) buckets.days31_60 += bal
            else if (daysOverdue <= 90) buckets.days61_90 += bal
            else buckets.over90 += bal
            return { ...inv, daysOverdue }
        })

        return { rows, buckets, generatedAt: today.toISOString() }
    }
}
