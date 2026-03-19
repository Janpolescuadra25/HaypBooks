import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { resolveAccount, createAndPostJE, createReversingJE, SYSTEM_ACCOUNTS } from '../shared/gl-integration'

@Injectable()
export class ApRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Vendors ──────────────────────────────────────────────────────────────

    async findVendors(workspaceId: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.vendor.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                ...(opts.search ? {
                    contact: { displayName: { contains: opts.search, mode: 'insensitive' } },
                } : {}),
            },
            include: {
                contact: { select: { id: true, displayName: true, contactEmails: true, contactPhones: true } },
                paymentTerm: true,
            },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
            orderBy: { contact: { displayName: 'asc' } },
        })
    }

    async findVendorById(workspaceId: string, contactId: string) {
        return this.prisma.vendor.findFirst({
            where: { contactId, workspaceId, deletedAt: null },
            include: {
                contact: { include: { contactEmails: true, contactPhones: true } },
                paymentTerm: true,
            },
        })
    }

    async createVendor(workspaceId: string, data: {
        displayName: string; email?: string; phone?: string
        paymentTermId?: string; isNonResident?: boolean; defaultWithholding?: number
    }) {
        return this.prisma.$transaction(async (tx) => {
            const contact = await tx.contact.create({
                data: {
                    workspaceId, type: 'VENDOR', displayName: data.displayName,
                    ...(data.email ? { contactEmails: { create: [{ email: data.email, type: 'WORK', isPrimary: true }] } } : {}),
                    ...(data.phone ? { contactPhones: { create: [{ phone: data.phone, type: 'WORK', isPrimary: true }] } } : {}),
                },
            })
            const vendor = await tx.vendor.create({
                data: {
                    contactId: contact.id, workspaceId,
                    paymentTermId: data.paymentTermId ?? null,
                    isNonResident: data.isNonResident ?? false,
                    defaultWithholding: data.defaultWithholding ?? null,
                },
            })
            return { ...vendor, contact }
        })
    }

    async updateVendor(workspaceId: string, contactId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            if (data.displayName) {
                await tx.contact.update({ where: { id: contactId }, data: { displayName: data.displayName } })
            }
            return tx.vendor.update({
                where: { contactId },
                data: { paymentTermId: data.paymentTermId, isNonResident: data.isNonResident, defaultWithholding: data.defaultWithholding },
                include: { contact: true },
            })
        })
    }

    async softDeleteVendor(contactId: string) {
        await this.prisma.vendor.update({ where: { contactId }, data: { deletedAt: new Date() } })
        return { success: true }
    }

    // ─── Bills ────────────────────────────────────────────────────────────────

    async findBills(companyId: string, opts: { vendorId?: string; status?: string; from?: Date; to?: Date; limit?: number; offset?: number } = {}) {
        return this.prisma.bill.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.vendorId ? { vendorId: opts.vendorId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
                ...(opts.from || opts.to ? { issuedAt: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
            },
            include: {
                vendor: { include: { contact: { select: { displayName: true } } } },
                lines: { select: { id: true, description: true, quantity: true, rate: true, amount: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { issuedAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findBillById(companyId: string, billId: string) {
        return this.prisma.bill.findFirst({
            where: { id: billId, companyId, deletedAt: null },
            include: {
                vendor: { include: { contact: { include: { contactEmails: true } } } },
                lines: { include: { account: { select: { id: true, code: true, name: true } }, item: { select: { id: true, name: true } } } },
                BillPaymentApplication: { include: { payment: true } },
                journalEntry: { select: { id: true, entryNumber: true, postingStatus: true } },
                createdBy: { select: { id: true, name: true } },
            },
        })
    }

    async createBill(data: {
        workspaceId: string; companyId: string; vendorId: string
        dueAt?: Date; paymentTermId?: string; currency?: string; description?: string
        createdById: string; lines: any[]
    }) {
        const total = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.bill.create({
            data: {
                workspaceId: data.workspaceId, companyId: data.companyId, vendorId: data.vendorId,
                status: 'DRAFT', postingStatus: 'DRAFT', total, balance: total,
                currency: data.currency ?? 'PHP', dueAt: data.dueAt ?? null,
                paymentTermId: data.paymentTermId ?? null, description: data.description ?? null,
                createdById: data.createdById,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId, workspaceId: data.workspaceId,
                        description: l.description ?? '', quantity: l.quantity ?? 1,
                        rate: l.rate ?? 0, amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.rate ?? 0),
                        accountId: l.accountId ?? null, itemId: l.itemId ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateBill(companyId: string, billId: string, data: any, updatedById: string) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, companyId, deletedAt: null } })
        if (!bill || bill.status !== 'DRAFT') return null

        return this.prisma.$transaction(async (tx) => {
            if (data.lines) await tx.billLine.deleteMany({ where: { billId } })
            const total = data.lines ? data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0) : bill.total
            return tx.bill.update({
                where: { id: billId },
                data: {
                    vendorId: data.vendorId, dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
                    paymentTermId: data.paymentTermId, currency: data.currency, description: data.description,
                    total, balance: total, updatedById,
                    ...(data.lines ? {
                        lines: {
                            create: data.lines.map((l: any) => ({
                                companyId, workspaceId: bill.workspaceId,
                                description: l.description ?? '', quantity: l.quantity ?? 1,
                                rate: l.rate ?? 0, amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.rate ?? 0),
                                accountId: l.accountId ?? null,
                            }))
                        },
                    } : {}),
                } as any,
                include: { lines: true },
            })
        })
    }

    async approveBill(companyId: string, billId: string) {
        const bill = await this.prisma.bill.findFirst({
            where: { id: billId, companyId },
            include: { lines: true },
        })
        if (!bill) return null
        const billNumber = bill.billNumber ?? `BILL-${Date.now()}`

        return this.prisma.$transaction(async (tx) => {
            // Resolve system accounts
            const apAcct  = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.ACCOUNTS_PAYABLE)
            const expAcct = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.OPERATING_EXPENSES)

            const total = Number(bill.total)

            // Build debit lines – use each line's accountId if set, else default expense
            const debitLines = bill.lines.map((l: any) => ({
                accountId: l.accountId ?? expAcct.id,
                debit: Number(l.amount),
                credit: 0,
                description: l.description ?? `Expense – ${billNumber}`,
            }))

            // Credit line: AP for total
            const creditLine = { accountId: apAcct.id, debit: 0, credit: total, description: `AP – ${billNumber}` }

            const jeId = await createAndPostJE(tx, {
                workspaceId: bill.workspaceId,
                companyId,
                date: bill.issuedAt ?? new Date(),
                description: `Bill ${billNumber}`,
                createdById: bill.createdById ?? 'system',
                lines: [...debitLines, creditLine],
            })

            return tx.bill.update({
                where: { id: billId },
                data: { status: 'APPROVED', billNumber, journalEntryId: jeId, postingStatus: 'POSTED' },
            })
        })
    }

    async voidBill(companyId: string, billId: string) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, companyId } })
        if (!bill) return null

        return this.prisma.$transaction(async (tx) => {
            if (bill.journalEntryId) {
                await createReversingJE(tx, companyId, bill.journalEntryId, `Void bill ${bill.billNumber ?? billId}`)
            }
            return tx.bill.update({
                where: { id: billId },
                data: { status: 'CANCELLED', postingStatus: 'VOIDED', deletedAt: new Date() },
            })
        })
    }

    // ─── Bill Payments ────────────────────────────────────────────────────────

    async findBillPayments(companyId: string, opts: { vendorId?: string; from?: Date; to?: Date; limit?: number; offset?: number } = {}) {
        return this.prisma.billPayment.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.from || opts.to ? { paymentDate: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
            },
            include: {
                bill: { include: { vendor: { include: { contact: { select: { displayName: true } } } } } },
                BillPaymentApplication: { include: { bill: { select: { id: true, billNumber: true, total: true } } } },
            },
            orderBy: { paymentDate: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findBillPaymentById(companyId: string, paymentId: string) {
        return this.prisma.billPayment.findFirst({
            where: { id: paymentId, companyId, deletedAt: null },
            include: {
                bill: { include: { vendor: { include: { contact: true } } } },
                BillPaymentApplication: { include: { bill: true } },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
        })
    }

    async recordBillPayment(data: {
        workspaceId: string; companyId: string; billId: string
        amount: number; paymentDate: Date; method: string
        referenceNumber?: string; bankAccountId?: string; currency?: string
        createdById: string; applications: Array<{ billId: string; amount: number }>
    }) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.billPayment.create({
                data: {
                    workspaceId: data.workspaceId, companyId: data.companyId, billId: data.billId,
                    amount: data.amount, paymentDate: data.paymentDate, method: data.method,
                    referenceNumber: data.referenceNumber ?? null, bankAccountId: data.bankAccountId ?? null,
                    currency: data.currency ?? 'PHP', createdById: data.createdById,
                },
            })

            for (const app of data.applications ?? []) {
                await tx.billPaymentApplication.create({
                    data: { workspaceId: data.workspaceId, billId: app.billId, paymentId: payment.id, amount: app.amount },
                })
                const bill = await tx.bill.findUnique({ where: { id: app.billId } })
                if (bill) {
                    const newBalance = Math.max(0, Number(bill.balance) - Number(app.amount))
                    const newStatus = newBalance <= 0 ? 'PAID' : 'APPROVED'
                    await tx.bill.update({ where: { id: app.billId }, data: { balance: newBalance, status: newStatus as any, paymentStatus: newBalance <= 0 ? 'PAID' : 'PARTIAL' as any } })
                }
            }

            // GL: Dr Accounts Payable, Cr Cash
            const apAcct   = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.ACCOUNTS_PAYABLE)
            const cashAcct = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.CASH)
            const jeId = await createAndPostJE(tx, {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                date: data.paymentDate,
                description: `Bill payment – ${data.referenceNumber ?? payment.id}`,
                createdById: data.createdById,
                lines: [
                    { accountId: apAcct.id,   debit: data.amount, credit: 0, description: 'AP settled' },
                    { accountId: cashAcct.id,  debit: 0, credit: data.amount, description: 'Cash paid' },
                ],
            })
            return tx.billPayment.update({ where: { id: payment.id }, data: { journalEntryId: jeId } })
        })
    }

    async voidBillPayment(companyId: string, paymentId: string) {
        const payment = await this.prisma.billPayment.findFirst({ where: { id: paymentId, companyId, deletedAt: null } })
        if (!payment) return null

        return this.prisma.$transaction(async (tx) => {
            const apps = await tx.billPaymentApplication.findMany({ where: { paymentId } })
            for (const app of apps) {
                const bill = await tx.bill.findUnique({ where: { id: app.billId } })
                if (bill && bill.status !== 'CANCELLED') {
                    const restoredBalance = Number(bill.balance) + Number(app.amount)
                    await tx.bill.update({ where: { id: app.billId }, data: { balance: restoredBalance, status: 'APPROVED' as any, paymentStatus: 'PARTIAL' as any } })
                }
                await tx.billPaymentApplication.delete({ where: { id: app.id } })
            }

            // Reverse the JE
            if (payment.journalEntryId) {
                await createReversingJE(tx, companyId, payment.journalEntryId, `Void bill payment ${paymentId}`)
            }

            return tx.billPayment.update({ where: { id: paymentId }, data: { deletedAt: new Date() } })
        })
    }

    // ─── Purchase Orders ──────────────────────────────────────────────────────

    async findPurchaseOrders(companyId: string, opts: { vendorId?: string; status?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.purchaseOrder.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.vendorId ? { vendorId: opts.vendorId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: {
                vendor: { include: { contact: { select: { displayName: true } } } },
                lines: { select: { id: true, description: true, quantity: true, rate: true, amount: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findPurchaseOrderById(companyId: string, poId: string) {
        return this.prisma.purchaseOrder.findFirst({
            where: { id: poId, companyId, deletedAt: null },
            include: {
                vendor: { include: { contact: { include: { contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
            },
        })
    }

    async createPurchaseOrder(data: {
        workspaceId: string; companyId: string; vendorId: string
        expectedAt?: Date; lines: any[]
    }) {
        const total = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.purchaseOrder.create({
            data: {
                workspaceId: data.workspaceId, companyId: data.companyId, vendorId: data.vendorId,
                status: 'OPEN', total, expectedAt: data.expectedAt ?? null,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId, workspaceId: data.workspaceId,
                        description: l.description ?? '', quantity: l.quantity ?? 1,
                        rate: l.rate ?? 0, amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.rate ?? 0),
                        itemId: l.itemId ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updatePoStatus(companyId: string, poId: string, status: string) {
        return this.prisma.purchaseOrder.update({ where: { id: poId }, data: { status: status as any } })
    }

    async convertPoToBill(companyId: string, workspaceId: string, poId: string, createdById: string) {
        const po = await this.prisma.purchaseOrder.findFirst({ where: { id: poId, companyId, deletedAt: null }, include: { lines: true } })
        if (!po) return null

        return this.prisma.$transaction(async (tx) => {
            const bill = await tx.bill.create({
                data: {
                    workspaceId, companyId, vendorId: po.vendorId,
                    status: 'DRAFT', postingStatus: 'DRAFT', total: po.total, balance: po.total,
                    currency: 'PHP', createdById,
                    lines: {
                        create: po.lines.map((l) => ({
                            companyId, workspaceId,
                            description: l.description ?? '', quantity: l.quantity,
                            rate: l.rate, amount: l.amount,
                        })),
                    },
                },
                include: { lines: true },
            })
            await tx.purchaseOrder.update({ where: { id: poId }, data: { status: 'RECEIVED', receivedAt: new Date() } })
            return bill
        })
    }

    // ─── AP Aging ─────────────────────────────────────────────────────────────

    async getApAging(companyId: string) {
        const bills = await this.prisma.bill.findMany({
            where: { companyId, deletedAt: null, status: { in: ['APPROVED', 'OVERDUE'] as any }, balance: { gt: 0 } },
            select: {
                id: true, billNumber: true, issuedAt: true, dueAt: true, total: true, balance: true,
                vendor: { include: { contact: { select: { displayName: true } } } },
            },
        })

        const today = new Date()
        const buckets = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0 }
        const rows = bills.map((b) => {
            const daysOverdue = b.dueAt ? Math.floor((today.getTime() - new Date(b.dueAt).getTime()) / 86400000) : 0
            const bal = Number(b.balance)
            if (daysOverdue <= 0) buckets.current += bal
            else if (daysOverdue <= 30) buckets.days1_30 += bal
            else if (daysOverdue <= 60) buckets.days31_60 += bal
            else if (daysOverdue <= 90) buckets.days61_90 += bal
            else buckets.over90 += bal
            return { ...b, daysOverdue }
        })
        return { rows, buckets, generatedAt: today.toISOString() }
    }
}
